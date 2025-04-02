### Shortcuts taken

- Importing SASS files seems to bring other unexpected CSS variables to our bundles (masterbar, sidebar), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.
- The WordPress.com logo should be built as a reusable component/package.
