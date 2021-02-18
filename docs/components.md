# Components

The UI of Calypso is built with _components_ and _sub-components_. We have constructed a system that allows us to enjoy benefits of style encapsulation and benefits from the natural CSS cascade (and native toolset) at the same time.

Our use of composition is one that embraces CSS reusability, with the cascade as a useful tool, but through composition — we reuse components not classes.

## Glossary

You will encounter the following types of components in Calypso:

- [UI components](../client/components/README.md) (UI primitives)
- [Blocks](../client/blocks/README.md) (components which are connected to state, or otherwise directly represent application entities)
- [Query components](./our-approach-to-data.md#query-components) (which handle data querying but don’t render anything)
- Higher-order components (which encapsulate and provide functionality)
- Section components (which are domain specific and not meant to be reused)

This document only focuses on UI components, i.e. React components that directly render HTML elements and require the addition of class attributes for styling. We have essentially two kinds of these:

- `component/index.jsx`
- `component/sub-component.jsx`

We'd call one "component" and the other "sub-component".

![Components!](https://cldup.com/CP_Z6Cqec--3000x3000.png)

A component is represented by the folder holding the main `index.jsx` file, and a sub-component is any other jsx file used to render pieces of a component. The folder is the "component" namespace and determines the class prefix for any sub-component in that folder. The only folder that matters for _namespacing_ is the immediate container of the jsx files.

There are three resulting aspects of this distinction:

- There's only one `style.scss` per component.
- Classes (both in components and sub-components) are always prefixed to the `component` name.
- Sub-folders do not care about their parent folder for any functional purposes.

That means a sub-component needs to write its HTML classes using the folder name (the component), and its styles will go to the folder's `style.scss` file. The decision to turn a sub-component into a component should take this into account, because once you do so its scope and prefix becomes global and independent.

## Syntax

We write classes like `.my-component__element` to indicate the component an element belongs to. Thus, component names (the folder holding the `index.jsx` file) need to be written with a global scope, specific, and clear enough in meaning.

We avoid vanilla _html_ selectors like `.my-component h1` in favor of `.my-component__title` whenever possible.

We also avoid Sass indentation outside of pseudo-selectors, media-queries, and `is-modifiers`. Most selectors should be a single class selector at the root of a style file. For more details on how we write and structure Sass code, look at the [Sass/CSS document](coding-guidelines/css.md).

## Folders

Any component folder should be able to be moved to `client/components` at any time without losing meaning or having conflicts. We place components in folders for organizational purposes, but they are not semantically coupled to this structure.

### Example

If we are creating a component to render post meta information and placing it in `my-sites/posts/meta-info`, we consider that to be incorrect. `meta-info` is too generic, its meaning obscure on its own — remember the sub-folder is not aware of its container —, and should better be written as `post-meta` or `post-meta-info`, regardless of what the parent folder may happen to be.

Imagine any folder with a jsx as a flat list of components.

Here's another example with `post-navigation` on how this decisions affect how we write the UI pieces:

If we place it in `posts/navigation.jsx` the classes used would be `.posts__navigation`, reflecting it's a sub-component of `posts` and would move with it anywhere `posts` goes. But if we move it to its own folder `posts/posts-navigation/index.jsx` then it would be written as `.posts-navigation`, and it would become its own piece independent of `posts`. If it is kept under the posts directory is only for organization.

Any of these are right approaches, the reason to create a folder should be a matter of _how independent we want a piece to be_, and whether it will be usable in other places. Any folder groupings outside of the immediate parent are purely organizational and should have no effect in the classes used or the naming of the components themselves.

## Reusability

Components are reusable in nature, regardless of where they are placed in the directory structure. This is an important clarification, since we don't place components in folders based on whether they are reusable or not. It's not a requirement for a component to live in `client/components` to be reused. Indeed, we use the `my-sites/site` component to render the current site in the editor, to render the site picker in the sidebar, to render sites in "Me", etc. The pieces that go to `client/components` are those that don't have a natural preference to one of our main section groups and are thus purer UI building blocks.

## Expressiveness

One advantage of avoiding inline JS styles as props are the times modifications of a child in the context of a remote parent are needed.

Imagine you want to change the border color of a `SiteIcon` component when it is displayed in the sidebar of `my-sites`. That `SiteIcon` component happens to be rendered within a `Site`, within a `SiteSelector`, and finally in a `Sidebar`.

If we were doing inline styles it would mean we need to pass down a style prop from `sidebar` (the component that wants to make the modification) all the way down to `site-icon` to modify that specific border style value. Which is messy, obscure, and requires passing down a meaningless attribute through components that don't care about it, coupling them with a design intent you want to express in the "Sidebar". Now, with CSS and our naming guidelines it becomes just an old `.sidebar .site-icon {}` on the sidebar's `style.scss` file.

That remains expressive, simple to read, and given our convention it immediately signals `site-icon` is a child component of `sidebar` at some level to whoever reads the styles or inspects them, reflecting the composition tree naturally in the stylesheet, and the intention of only modifying that individual component in this specific context. Since specificity also increases, it means it doesn't matter where in the build process the sidebar stylesheet order comes.

## Adding A New Component

If you'd like to add a new component to Calypso, please review our [new component checklist](new-component-checklist.md).
