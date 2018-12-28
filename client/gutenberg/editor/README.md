# Gutenberg in Calypso Integration

## Editor Selection Flows

See [`isGutenbergEnabled`](../../state/selectors/is-gutenberg-enabled.js) and [`getEditorUrl`](../../state/selectors/get-editor-url.js).

## Initialization

See [`init.js`](./init.js) and [`controller.js`](./controller.js).

## API Middleware

See [`applyAPIMiddleware`](./api-middleware/index.js).

## Additional State

See [`/calypso-store`](./calypso-store).

## The `edit-post` Module

The Gutenberg's [`edit-post` module](https://github.com/WordPress/gutenberg/tree/84e1e8031cb54b322f01adde9d560112290c6909/packages/edit-post), which contains the header, sidebar, and other essential parts of the editor, is not meant to be used outside of WordPress Core, and therefore is not fully exported and available externally.

To integrate it in Calypso, we had to import it and keep it updated manually. It can be found in the [`/edit-post` folder](./edit-post).

When it comes to customize it for Calypso, the current best practices are:

- If the change is major, please **move the file away from `/edit-post` and into [`/components`](./components)**, and apply the changes as needed.

- If the change is minor, it's ok to **do it in `/edit-post`, and clearly mark it with a `// GUTENLYPSO` comment**, so that it won't be overwritten in a package update.

### The Layout Exception

The [`Layout`](./edit-post/components/layout/index.js) component is the busiest file in the `edit-post` package, as it contains all the logic directly related to the editor UI. In more than a way, it's the equivalent of Calypso's [`post-editor.jsx`](../../post-editor/post-editor.jsx) component.

Inevitably, we are customizing it a lot, and will likely keep customizing in the future. But, as it's such an important piece of the Gutenberg puzzle, moving it into [`/components`](./components) is not as simple and future-friendly as for other components.

Instead, we should **add all our `Layout` customizations into the [`GutenlypsoLayout`](./layout/index.jsx) override component**, and import only that into Gutenberg's [`Layout`](./edit-post/components/layout/index.js).

## Additional Components

Components that are not direct replacements for the `edit-post` package or its `Layout` component, should be added as sub-folders in [`/gutenberg/editor`](./) (see for example [`EditorDocumentHead`](./editor-document-head/index.jsx)).

## Style Overrides

See [`style.scss`](./style.scss).
