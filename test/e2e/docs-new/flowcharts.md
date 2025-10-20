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
