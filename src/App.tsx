import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, X, ChevronRight } from 'lucide-react';
import logoSvg from './assets/logo.svg';

// ============================================================================
// TYPES
// ============================================================================

type AlimentoClassif = 'P' | 'C' | 'L';

interface Alimento {
  id: number;
  nome: string;
  prot: number;
  carb: number;
  lip: number;
  classif: AlimentoClassif;
}

interface AlimentoSearchable extends Alimento {
  searchTerms: string;
}

interface ComparisonRow {
  label: string;
  fromValue: number;
  toValue: number;
  isSelected: boolean;
  suffix: string;
}

declare global {
  interface Window {
    ALIMENTOS?: Alimento[];
  }
}

// ============================================================================
// SERVICES
// ============================================================================

/**
 * Normalizes text by removing accents and converting to lowercase
 */
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

/**
 * Prepares food list for searching by pre-computing normalized search terms
 */
const prepareSearchableList = (alimentos: Alimento[]): AlimentoSearchable[] => {
  return alimentos.map(alimento => ({
    ...alimento,
    searchTerms: normalizeText(alimento.nome)
  }));
};

/**
 * Searches foods by multiple terms (space-separated)
 * Each term must be present in the food name
 */
const searchFoods = (
  query: string,
  foods: AlimentoSearchable[],
  excludeId?: number
): AlimentoSearchable[] => {
  if (!query.trim()) return foods.filter(f => f.id !== excludeId);
  
  const normalizedQuery = normalizeText(query);
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
  
  return foods.filter(food => {
    if (excludeId && food.id === excludeId) return false;
    return terms.every(term => food.searchTerms.includes(term));
  });
};

/**
 * Calculates destination food quantity based on macronutrient classification
 */
const calculateDestinationQuantity = (
  fromFood: Alimento,
  toFood: Alimento,
  fromQuantity: number
): number => {
  const attr = fromFood.classif === 'P' ? 'prot' : fromFood.classif === 'C' ? 'carb' : 'lip';
  const fromPer100g = fromFood[attr];
  const toPer100g = toFood[attr];
  
  const fromTotal = (fromPer100g * fromQuantity) / 100;
  return Math.round((100 * fromTotal) / toPer100g);
};

/**
 * Calculates nutritional values for a given quantity
 */
const calculateNutrition = (food: Alimento, quantity: number) => {
  const multiplier = quantity / 100;
  const kcal = food.prot * 4 + food.carb * 4 + food.lip * 9;
  return {
    weight: quantity,
    kcal: kcal * multiplier,
    prot: food.prot * multiplier,
    carb: food.carb * multiplier,
    gord: food.lip * multiplier
  };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Logo: React.FC = () => (
  <img src={logoSvg} alt="Assim ou Assado" className="w-10 h-10" />
);

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (food: Alimento) => void;
  foods: AlimentoSearchable[];
  placeholder: string;
  disabled?: boolean;
  excludeId?: number;
  maxResults?: number;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  foods,
  placeholder,
  disabled = false,
  excludeId,
  maxResults = 6
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const results = searchFoods(value, foods, excludeId).slice(0, maxResults);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(results[selectedIndex]);
      setIsOpen(false);
    }
  };
  
  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((food, index) => (
              <button
                key={food.id}
                onClick={() => {
                  onSelect(food);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
              >
                {food.nome}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500">
              Nenhum alimento encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ComparisonTable: React.FC<{ rows: ComparisonRow[] }> = ({ rows }) => (
  <div className="space-y-3">
    {rows.map((row, index) => (
      <div
        key={index}
        className={`flex items-center gap-2 text-lg ${
          row.isSelected ? 'text-gray-500' : 'text-black'
        }`}
      >
        <div className="font-medium w-12 flex-shrink-0">{row.label}</div>
        <div className={`flex-1 border-b-2 border-dotted min-w-0 ${
          row.isSelected ? 'border-gray-500' : 'border-black'
        }`}></div>
        <div className="text-right w-16 flex-shrink-0">{row.fromValue}{row.suffix}</div>
        <div className="flex items-center flex-shrink-0">
          <div className={`border-b-2 border-dotted w-4 ${
            row.isSelected ? 'border-gray-500' : 'border-black'
          }`}></div>
          <ChevronRight className="w-4 h-4" />
        </div>
        <div className="text-left w-32 flex-shrink-0">
          {row.toValue}{row.suffix}
          {!row.isSelected && row.toValue !== row.fromValue && (
            <sup className="ml-1">
              <strong>
                <em>
                  ({row.toValue > row.fromValue ? '+' : ''}
                  {(row.toValue - row.fromValue).toFixed(row.label === 'Gr' || row.label === 'Kcal' ? 0 : 1)})
                </em>
              </strong>
            </sup>
          )}
        </div>
      </div>
    ))}
  </div>
);

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const links = [
    { label: 'Termos de Uso', href: '/termos-de-uso' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'Licenças', href: '/licencas' },
    { label: 'GitHub', href: 'https://github.com/experimentotech/assim-ou-assado-webapp' },
    { label: 'YouTube', href: 'https://youtube.com/@ExperimentoTech' },
    { label: 'Instagram', href: 'https://instagram.com/experimentotech' },
    { label: 'TikTok', href: 'https://tiktok.com/experimentotech' },
    { label: 'Site', href: 'https://www.experimentotech.com' }
  ];
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <button onClick={onClose} className="mb-6 text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
          <nav className="space-y-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block text-gray-700 hover:text-blue-600"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    new Promise<void>((resolve) => {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        setIsVisible(false);
      }
      resolve();
    });
  }, []);
  
  const handleClose = () => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    localStorage.setItem('cookie-consent', expiryDate.toISOString());
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-300 p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-black">
          Este site utiliza "Cookies" para melhorar a sua experiência.{' '}
          <a href="/privacidade" className="underline">
            Saiba mais
          </a>
          .
        </p>
        <button
          onClick={handleClose}
          className="bg-black text-white px-4 py-2 rounded font-medium whitespace-nowrap hover:bg-gray-800"
        >
          FECHAR
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchableAlimentos, setSearchableAlimentos] = useState<AlimentoSearchable[]>([]);
  
  const [fromFood, setFromFood] = useState<Alimento | null>(null);
  const [fromFoodSearch, setFromFoodSearch] = useState('');
  const [fromQuantity, setFromQuantity] = useState('');
  
  const [toFood, setToFood] = useState<Alimento | null>(null);
  const [toFoodSearch, setToFoodSearch] = useState('');
  const [toQuantity, setToQuantity] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    new Promise<void>((resolve) => {
      setSearchableAlimentos(prepareSearchableList(window.ALIMENTOS || []));
      resolve();
    });
  }, []);
  
  useEffect(() => {
    if (!fromFood || !toFood || !fromQuantity) {
      return;
    }

    const qty = parseFloat(fromQuantity);
    if (isNaN(qty) || qty == 0) {
      return;
    }

    const calculatedQty = calculateDestinationQuantity(fromFood, toFood, qty);

    new Promise<void>((resolve) => {
      setToQuantity(calculatedQty.toFixed(0));
      resolve();
    });
  }, [fromFood, toFood, fromQuantity]);
  
  const handleFromFoodSelect = (food: Alimento) => {
    setFromFood(food);
    setFromFoodSearch(food.nome);
  };
  
  const handleToFoodSelect = (food: Alimento) => {
    setToFood(food);
    setToFoodSearch(food.nome);
  };
  
  const handleFromFoodClear = () => {
    setFromFood(null);
    setFromFoodSearch('');
    setFromQuantity('');
    setToFood(null);
    setToFoodSearch('');
    setToQuantity('');
  };
  
  const handleToFoodClear = () => {
    setToFood(null);
    setToFoodSearch('');
    setToQuantity('');
  };
  
  const comparisonRows: ComparisonRow[] = React.useMemo(() => {
    if (!fromFood || !toFood || !fromQuantity || !toQuantity) {
      return [];
    }
    
    const fromQty = parseFloat(fromQuantity);
    const toQty = parseFloat(toQuantity);
    const fromNutrition = calculateNutrition(fromFood, fromQty);
    const toNutrition = calculateNutrition(toFood, toQty);
    
    return [
      {
        label: 'Gr',
        fromValue: Math.round(fromNutrition.weight),
        toValue: Math.round(toNutrition.weight),
        isSelected: false,
        suffix: 'g'
      },
      {
        label: 'Kcal',
        fromValue: Math.round(fromNutrition.kcal),
        toValue: Math.round(toNutrition.kcal),
        isSelected: false,
        suffix: ''
      },
      {
        label: 'Prot',
        fromValue: parseFloat(fromNutrition.prot.toFixed(1)),
        toValue: parseFloat(toNutrition.prot.toFixed(1)),
        isSelected: fromFood.classif === 'P',
        suffix: 'g'
      },
      {
        label: 'Carb',
        fromValue: parseFloat(fromNutrition.carb.toFixed(1)),
        toValue: parseFloat(toNutrition.carb.toFixed(1)),
        isSelected: fromFood.classif === 'C',
        suffix: 'g'
      },
      {
        label: 'Gord',
        fromValue: parseFloat(fromNutrition.gord.toFixed(1)),
        toValue: parseFloat(toNutrition.gord.toFixed(1)),
        isSelected: fromFood.classif === 'L',
        suffix: 'g'
      }
    ];
  }, [fromFood, toFood, fromQuantity, toQuantity]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assim ou Assado</h1>
            <p className="text-sm text-gray-600">por @experimentotech</p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Encontre a medida certa pra sua substituição
        </h2>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="space-y-4">
            <Autocomplete
              value={fromFoodSearch}
              onChange={(value) => {
                setFromFoodSearch(value);
                if (!value) handleFromFoodClear();
              }}
              onSelect={handleFromFoodSelect}
              foods={searchableAlimentos}
              placeholder="Ingrediente inicial"
            />
            
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                value={fromQuantity}
                onChange={(e) => {
                  setFromQuantity(e.target.value);
                  if (!e.target.value) setToQuantity('');
                }}
                placeholder="Quantidade"
                disabled={!fromFood}
                className="col-span-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <div className="flex items-center justify-center border border-gray-300 rounded-lg text-gray-600">
                gr
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="mx-4 p-2 bg-white rounded-full">
                <Logo />
              </div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <Autocomplete
              value={toFoodSearch}
              onChange={(value) => {
                setToFoodSearch(value);
                if (!value) handleToFoodClear();
              }}
              onSelect={handleToFoodSelect}
              foods={searchableAlimentos}
              placeholder="Ingrediente final"
              disabled={!fromFood}
              excludeId={fromFood?.id}
            />
            
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                value={toQuantity}
                readOnly
                placeholder="Quantidade"
                className="col-span-3 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
              />
              <div className="flex items-center justify-center border border-gray-300 rounded-lg text-gray-600">
                gr
              </div>
            </div>
          </div>
        </div>
        
        {comparisonRows.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Outras alterações
            </h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ComparisonTable rows={comparisonRows} />
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-white border-t mt-auto flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <a href="/termos-de-uso" className="text-gray-600 hover:text-blue-600">
              Termos de Uso
            </a>
            <a href="/privacidade" className="text-gray-600 hover:text-blue-600">
              Privacidade
            </a>
            <a href="/licencas" className="text-gray-600 hover:text-blue-600">
              Licenças
            </a>
            <a
              href="https://github.com/experimentotech/assim-ou-assado-webapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              GitHub
            </a>
            <a
              href="https://youtube.com/@ExperimentoTech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              YouTube
            </a>
            <a
              href="https://instagram.com/experimentotech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/experimentotech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              TikTok
            </a>
            <a
              href="https://www.experimentotech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              Site
            </a>
          </div>
        </div>
      </footer>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ConsentBanner />
    </div>
  );
};

export default App;
