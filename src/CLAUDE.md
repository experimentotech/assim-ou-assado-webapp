# Basic rules

- Follow the filosophy of KISS (keep it stupid simple) and DRY (don't repeat yourself)
- Whenever possible, generate components that can be reused
- If possible, use tailwind v4 or higher
- Use an architecture separating 'pages', components and services.

# Introduction

I'm working on a project that helps users to replace food based on micronutrients.

Basic macronutrients:

- Protein
- Carbohydrate (Carb)
- Lipid (Fat)

Essentially every food has a prevailling macronutrient. For example:

A chicken breast has more protein than any other macronutrient; a cup of rice has more carbohydrate than any other else; a spoon of oil has more fat, and so on.

So I'm going to develop an application that allows the user to select an origin food (Food A), a destination food (Food B), set the portion of the origin food and the app suggests the portion of the destination one and shows a table comparing both food A and B.

What I've done so far is creating a new react project using `npm create vite@latest` command, selected 'Typescript' as primary language, and 'Vite + React compiler' as compiler system.

# Application Structure

A visual demonstration of how webapp should appear.

 ---------------------------------
| # Assim ou Assado            __ |
| por @experimentotech         __ |
|                              __ |
|---------------------------------|
| Conversor de ingredientes       |
|                                 |
|  -----------------------------  |
| |  ------------------------   | |
| | | Ingrediente inicial    |  | |
| |  ------------------------   | |
| |  ------------    ----       | |
| | | Quantidade |  | gr |      | |
| |  ------------    ----       | |
| |                             | |
| | ------ (Logo SVG) --------  | |
| |                             | |
| |  ------------------------   | |
| | | Ingrediente final      |  | |
| |  ------------------------   | |
| |  ------------    ----       | |
| | | Quantidade |  | gr |      | |
| |  ------------    ----       | |
|  -----------------------------  |
|                                 |
|  outras alterações              |
|  -----------------------------  |
| | Gr ... 100g ...> 90g (-10)  | |
| | Kcal .. 210 ...> 250 (+40)  | |
| | Prot . 2.1g ..> 1.9g (-0.2) | |
| | Carb .. 10g ..> 10g         | |
| | Gord ... 0g ...> 0g         | |
|  -----------------------------  |
|                                 |
|---------------------------------|
| footer                          |
|                                 |
| YouTube Instagram Privacidade   |
| "Termos de uso" Site            |
 ---------------------------------

Now, a html based structure of how the app should be organized:


```html
<div class="root">
  <header>
    <h1>Assim ou Assado</h1>
    <p>por @experimentotech</p>
    <a class="toggle-menu anchor-right"><i class="icon menu"></i></a>
  </header>
  <main>
    <h4>Encontre a medida certa pra sua substituição</h4>
    <div class="card">
      <div class="field-group">
        <i class="icon search"></i>
        <input type="text" name="from-food" label="Ingrediente inicial" />
      </div>
      <div class="field-group sm-9">
        <input type="text" name="from-quantity" label="quantidade" />
      </div>
      <div class="field-group sm-3">
        <span class="border border-rounded">gr</span>
      </div>

      <div class="divider">
        <div class="logo-container"><i class="assim-assado-logo-svg"></i></div>
      </div>

      <div class="field-group sm-12">
        <i class="icon search"></i>
        <input type="text" name="to-food" label="Ingrediente final" />
      </div>
      <div class="field-group sm-9">
        <input type="text" name="to-quantity" label="quantidade" />
      </div>
      <div class="field-group sm-3">
        <span class="border border-rounded">gr</span>
      </div>
    </div>

    <h4>Outras alterações</h4>
    <div class="card">
      <div class="comparison-table">
        <!-- Comparing weight -->
        <div class="row">
          <div class="col-0 label">Gr</div>
          <div class="col-1 dotted-divider"></div>
          <div class="col-2 from-value">150</div>
          <div class="col-3 dotted-divider icon chevron-right"></div>
          <div class="col-4 to-value">230 <sup><strong><em>+80</em></strong></sup></div>
        </div>

        <!-- Comparing calories -->
        <div class="row">
          <div class="col-0 label">Kcal</div>
          <div class="col-1 dotted-divider"></div>
          <div class="col-2 from-value">192</div>
          <div class="col-3 dotted-divider icon chevron-right"></div>
          <div class="col-4 to-value">175 <sup><strong><em>-16,4</em></strong></sup></div>
        </div>

        <!-- Comparing protein -->
        <div class="row">
          <div class="col-0 label">Prot</div>
          <div class="col-1 dotted-divider"></div>
          <div class="col-2 from-value">3,8</div>
          <div class="col-3 dotted-divider icon chevron-right"></div>
          <div class="col-4 to-value">1,4 <sup><strong><em>-0,6</em></strong></sup></div>
        </div>

        <!-- Comparing carbs -->
        <div class="row selected">
          <div class="col-0 label">Carb</div>
          <div class="col-1 dotted-divider"></div>
          <div class="col-2 from-value">42</div>
          <div class="col-3 dotted-divider icon chevron-right"></div>
          <div class="col-4 to-value">42</div>
        </div>

        <!-- Comparing fat -->
        <div class="row selected">
          <div class="col-0 label">Gord</div>
          <div class="col-1 dotted-divider"></div>
          <div class="col-2 from-value">0,3</div>
          <div class="col-3 dotted-divider icon chevron-right"></div>
          <div class="col-4 to-value">0,1 <sup><strong><em>-0,2</em></strong></sup></div>
        </div>
      </div>
    </div>
  </main>
</div>
```

# Data Structure

There's a list of foods generated externally by other application that injects it globally.

```
type AlimentoClassif = 'P' | 'C' | 'L';

interface Alimento {
    id: number;
    nome: string;
    kcal: number;
    prot: number;
    carb: number;
    lip: number;
    classif: AlimentoClassif;
}

window.ALIMENTOS: Alimento[];
```

# Components

On topbar menu, when clicked, it should appear a sidebar from the rightside, with the following items:

- - Termos de Uso: Link to "/termos-de-uso"
  - Privacidade: Link to "/privacidade"
  - Licenças: Link to "/licencas"
  - GitHub: Link to "https://github.com/experimentotech/assim-ou-assado-webapp"
  - YouTube: Link to "https://youtube.com/@ExperimentoTech"
  - Instagram: Link to "https://instagram.com/experimentotech"
  - TikTok: Link to "https://tiktok.com/experimentotech"
  - Site: Link to "https://www.experimentotech.com"

The behavior of the sidebar menu is, on opened, move the whole site to the left, and on closed, move back to the right position.

Text fields 'from-food' and 'to-food' should behave as an autocomplete and should present a "search" (magnifier) icon at the beginning (left). The field 'from-food' should search on ALIMENTOS list. When a text is filled in, it should appear a "x" button allowing the user to "clean" the field. On 'no results', it should show an 'Nenhum alimento encontrado' item. The autocomplete should list on 6 items at a time (make it parameterize). It should be possible to navigate on results through keyboard (arrows up and down).

The 'to-food' field should present all items from ALIMENTOS list ignoring the selected 'from-food'. The field should be disabled by default and enable once a 'from-food' is selected.

When 'to-food' is cleaned, it should reset 'to-quantity' as well.

When 'from-quantity' is cleaned, it should clean 'to-quantity' as well.

When "from-food" field is cleaned, it should clean 'from-quantity', 'to-food' and 'to-quantity' fields.

The field 'from-quantity' is numeric and should be set by the user.

The field 'to-quantity' is calculated based on selected 'from-food'. To resolve the value, it should consider the `classif` property to determine what macro should be use in comparison to infer the value. 

Example:

Given 2 foods:

- Food A has every 100g kcal=150; prot=6; carb=12; fat=2; classif=C
- Food B has every 100g kcal=80; prot=2; carb=9; fat=1; classif=C

The user sets 150 as 'from-quantity'. Therefore, 150g of Food A has kcal=225; prot=9; carb=18; fat=3.

As food A is classified as "C", it means, a carb, we have to calculate how much of Food B do we need to reach to 18g of carb.

So, the formula is 100*18/9 = 200. So, the field 'to-quantity' should be filled with 200.

Once "Food B" is selected and weight is calculated, now we need to fulfill the "comparison-table".

As the name says, the table should behave as a table.

- The col-0 should contain the label. It accepts 'Gr' (weight), Kcal, Prot, Carb, Gord.
- The col-1 should be fulfilled with dots.
- col-2 contains the value of 'from-food' with the text right aligned
- col-3 is a dotted arrow ending with a chevron-right icon
- col-4 contains the value of the resolved 'to-food' left aligned and the difference as superscript, containing the signal + or -, bold and italic text between parenthisis.
- values of 'from-food' and 'to-food' should respect the following rules:
  - weight and kcal should appear as integer;
  - Prot, carb and gord should appear as float with 1 decimal place;

Example (in markdown):

Given 2 foods:

- Food A: 150g; kcal=225; prot=9; carb=18; fat=3;
- Food B: 200g; kcal=160; prot=4; carb=18; fat=2;

The result table:

|  Gr  | ...... | 150g | ...> | 200g <sup><strong><em>(+50)</em></strong></sup> |
| Kcal | ...... |  225 | ...> | 160 <sup><strong><em>(-65)</em></strong></sup>  |
| Prot | ...... |    9 | ...> | 4 <sup><strong><em>(-5)</em></strong></sup>     |
| Carb | ...... |   18 | ...> | 18                                              |
| Gord | ...... |    3 | ...> | 2 <sup><strong><em>(-1)</em></strong></sup>     |

As you can see, all columns should have the same width. The selected macro, in our example, "carb", should be colored as medium gray. The rest should be black.

# Layout

Some rules to consider:

- Avoid to use 'elevations' in the compontents.
- All fields should be placed in the same card.
- To separate 'from' to 'to', use a line with a circle in the middle, and place the logo within the circle.
- The logo is stored in the file 'src/assets/assim-ou-assado.svg'
- The application should be mobile first
- In the browser, the max width should be 670px
- Components should be centralized horizontally
- In the footer I need the following links:
  - Termos de Uso: Link to "/termos-de-uso"
  - Privacidade: Link to "/privacidade"
  - Licenças: Link to "/licencas"
  - GitHub: Link to "https://github.com/experimentotech/assim-ou-assado-webapp"
  - YouTube: Link to "https://youtube.com/@ExperimentoTech"
  - Instagram: Link to "https://instagram.com/experimentotech"
  - TikTok: Link to "https://tiktok.com/experimentotech"
  - Site: Link to "https://www.experimentotech.com"

# Consent

As part of regulation laws in various countries, we need to show a banner informing the user about collected cookies.

The consent should appear at the bottom, background yellow, with close button "FECHAR" black, with a minimum height enough to allow the user to see the banner and close it easier.

The text must be:

> Este site utiliza "Cookies" para melhorar a sua experiência. [Saiba mais](/privacidade).

When user closes the pop-up window, it should store a flag in cookies to avoid showing the window to the user for a month.

# Search mechanism

The fields 'from-food' and 'to-food' must search words by terms. Example:

Given a list:

- (A) Filé de frango grelhado
- (B) Filé de peixe grelhado
- (C) Filé mignon

- When the user query "file" (without accent), it should return all occurrences;
- When query "grelhado", it should return items A and B
- When query "grelhado frango", it should return item A

In other words, search should work looking for terms without accents and lowercase, not the item itself.

I need you to create a function that do it, unit test it and integrate with the frontend component.

I can pre-compile the searchable list of food, just show me the desired structure.
