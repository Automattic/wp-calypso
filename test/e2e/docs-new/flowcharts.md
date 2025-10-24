# Flowcharts

## Table of contents

- [Overview](#overview)
- [Example](#example)

## Overview

Flowcharts are a good way of representing what an e2e test covers in the system.

MermaidJS is a good resource for generating flowcharts using plain text source formatting, which is viewable on GitHub and in VSCode using an extension.

## Example

An example is:

```mermaid
flowchart TB
    %% --- Main paths ---
    n1["Import (wp-admin Importers List)"]
    n2["WordPress → Run Importer"]
    icm["Import content from WordPress"]
    n4["Upload XML file"]
    n5["Confirm authors"]
    n6["Import"]

    n7["WordPress.com → Run Importer"]
    n8["Let's find your site"]
    n9["Enter WordPress site"]
    wdywtd["What do you want to do?"]
    n11["Import content only"]
    n13["Migrate site"]
    n14["Let us migrate your site"]
    n15["Get started"]

    n16["Unknown entry point"]
    n17["Import Content"]
    n18["I want to import content from: WordPress"]
    n19["Let's find your site"]
    n20["Enter WordPress site"]
    n22["Pick your current platform"]
    n23["Import content from another platform or file"]
    n24["WordPress"]

    %% --- Flows ---
    n1 -- Test One --> n2 --> icm --> n4 --> n5 --> n6
    n1 -- Test Two --> n7 --> n8 --> n9 --> wdywtd
    wdywtd -- Tests Two & Three --> n11 --> icm
    wdywtd -- Test Four --> n13 --> n14 --> n15

    n16 --> n17 --> n18 --> n19
    n19 -- Test Three --> n20 --> wdywtd
    n19 -- Test Four --> n22 --> n23 --> n24 --> wdywtd

    %% --- Styles (grouped for clarity) ---
    classDef white fill:#FFFFFF,color:black
    classDef blue fill:#BBDEFB,color:black
    classDef green fill:#C8E6C9,color:black
    classDef red fill:#FFCDD2,color:black

    class n1 green
    class n2,n4,n6,n7,n9,n11,n13,n15,n18,n20,n22,n24 white
    class icm,n5,n8,wdywtd,n14,n17,n19,n23 blue
    class n16 red
```

You can easily annotate a Playwright Test test with a link to the MermaidJS flow chart URL like:

```typescript
annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNkdFq2zAUhl_l4MJIoRnIcewkg13ESWHQtaOk9KLZhWvLs5itYyQZk5Xe9gH2iHuSKZGI3WUOcm6C_Z3_19H34qWYUW_h5SW2aZEIBZvlloN-OHnael-qGvW7UVuPk6xiHMwLKiTcMKkut953GI9hQ6WCO071_8_AfT34lWasqeDP22-4b7oxzdt037CTriRFrihXkAuswMx3-MTggcYf6hKTDH6xGnJW0o4JDDM9GwmjGHnORAVJowoU8rILmJqA8BjQfSLHNTctGizS2COK7JugUn5M8dy2kRmZ6ZEbqj4kNcpPUh-fZ7DDRoBkqrfIzNBzTa_1AsIe_dDxXOIPSLJsX9o73l7WLSqQjaCAOeitxQ5qZHr7ggraF7UpBLWqiN9dVmwuqxdqHZGDJGgTnaUQ2OndLk58ESuMBCcFMPrHYM8AsQ7J9JxoYkWR8D_hw3pJaMei94LNZ6l2Jd2L1l3l4iKercN4fpViiWLxXCbpz3eYb7C20OIGoYnNWi5X6-vlIBZY7PrwDGJTt7TQLS1yWWDmVjl3qyTkyMWrlT_M-W61ZOLYGzjmhY5cdKZ3__Ne_wJScbSp',
		},
```

which means when it runs the HTML report shows a link to the flowchart:

![Example annotated report](./files/example-annotated-report.png)
