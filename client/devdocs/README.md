# Devdocs: In-app documentation browser (client)

Here developers and users can browse and search Calypso’s documentation.

It lives here, instead of separately in order to be closer to Calypso and to encourage developers to keep the documentation within the project, instead of at external locations.

The source of the documentation are all the markdown files in the Calypso repository.

## Glossary

- **Result** – a single markdown file in a list, represented in the code as a structure with fields: `path` (relative path from project’s root), `title` (title extracted from the text), and `snippet` (snippet extracted according to query terms)

## Modules

- **service** – a "documentation service" allowing searching, listing, and fetching the contents of documents. See server/devdocs/index.js for the service implementation.

## Design

In-app browser of design assets. Here designers and developers can visualize different components used in Calypso for easy access and reference.

## Icons

Description of how to use Gridicons, or style guidelines for app icons and favicons.
