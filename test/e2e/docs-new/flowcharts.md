## Flowcharts

Flowcharts are a good way of representing what an e2e test covers in the system.

MermaidJS is a good resource for generating flowcharts using plain text source formatting, which is viewable on GitHub and in VSCode using an extension.

An example is:

```mermaid
flowchart TB
    wpa["Import (wp-admin Importers List)"] -- Test One --> n2["Squarespace → Run Importer"]
    n2 --> icm["Import content from Squarespace"]
    icm --> n4["Upload zip file"]
    n4 --> n5["Import content from Squarespace (Confirm authors)"]
    n5 --> n6["Import"]
    wpa -- Test Two --> n7["WordPress.com → Run Importer"]
    n7 --> n8@{ label: "Let's find your site" }
    n8 --> n9["Enter Squarespace site address"]
    n11["Not sure of entry point here"] --> n12["Import Content"]
    n12 --> n13["I want to import content from: Squarespace"] & n18["Choose from full list"]
    n13 -- Test Three --> n14["Import Content (Upload zip file)"]
    n14 --> n15["Upload zip file"]
    n15 --> n16["Import Content (Confirm authors)"]
    n16 --> n17["Import"]
    n9 --> icm
    n18 --> wpa

    style wpa fill:#C8E6C9,color:black
    style n2 fill:#FFFFFF,color:black
    style icm fill:#BBDEFB,color:black
    style n4 fill:#FFFFFF,color:black
    style n5 fill:#BBDEFB,color:black
    style n6 fill:#FFFFFF,color:black
    style n7 fill:#FFFFFF,color:black
    style n8 fill:#BBDEFB,color:black
    style n9 fill:#FFFFFF,color:black
    style n11 fill:#FFCDD2,color:black
    style n12 fill:#BBDEFB,color:black
    style n13 fill:#FFFFFF,color:black
    style n18 fill:#FFFFFF,color:black
    style n14 fill:#BBDEFB,color:black
    style n15 fill:#FFFFFF,color:black
    style n16 fill:#BBDEFB,color:black
    style n17 fill:#FFFFFF,color:black
```

You can easily annotate a Playwright Test test with a link to the MermaidJS flow chart URL like:

```ts
annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNkdFq2zAUhl_l4MJIoRnIcewkg13ESWHQtaOk9KLZhWvLs5itYyQZk5Xe9gH2iHuSKZGI3WUOcm6C_Z3_19H34qWYUW_h5SW2aZEIBZvlloN-OHnael-qGvW7UVuPk6xiHMwLKiTcMKkut953GI9hQ6WCO071_8_AfT34lWasqeDP22-4b7oxzdt037CTriRFrihXkAuswMx3-MTggcYf6hKTDH6xGnJW0o4JDDM9GwmjGHnORAVJowoU8rILmJqA8BjQfSLHNTctGizS2COK7JugUn5M8dy2kRmZ6ZEbqj4kNcpPUh-fZ7DDRoBkqrfIzNBzTa_1AsIe_dDxXOIPSLJsX9o73l7WLSqQjaCAOeitxQ5qZHr7ggraF7UpBLWqiN9dVmwuqxdqHZGDJGgTnaUQ2OndLk58ESuMBCcFMPrHYM8AsQ7J9JxoYkWR8D_hw3pJaMei94LNZ6l2Jd2L1l3l4iKercN4fpViiWLxXCbpz3eYb7C20OIGoYnNWi5X6-vlIBZY7PrwDGJTt7TQLS1yWWDmVjl3qyTkyMWrlT_M-W61ZOLYGzjmhY5cdKZ3__Ne_wJScbSp',
		},
```

which means when it runs the HTML report shows a link to the flowchart:

![Example annotated report](./files/example-annotated-report.png)
