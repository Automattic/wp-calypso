# Editor Components

This folder holds reusable editor components exported by the `editor` module.
These components combined as children of the `EditorProvider` component can be use to build alternative Editor Layouts.

## Which components should live in this folder?

 - A component in this folder is any component you can reuse to build your own editor's layout.
 - It shouldn't include any "layout styling".
 - the only requirement to use this component is to to be included as a children of EditorProvider in the elements' hierarchy.
