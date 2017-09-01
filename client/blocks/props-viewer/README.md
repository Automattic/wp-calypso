Props Viewer
==========

`<PropsViewer />` is a component that will render a table given a component name and an example component to render.

## Usage

``` jsx
import PropsViewer from 'blocks/props-viewer';

render() {
	const anExample = ( <AuthorSelectorExample /> );
	return ( <PropsViewer component='author-selector' example={ anExample } /> )
}
```

where `component` is the slug of the component and `example` is the example component to render.

## Rebuilding the component props object


This command will rebuild the json file:

`make server/devdocs/proptypes-index.json`

## Props

| name      | type   | required | description
|-----------|--------|----------|------------
| component | string | yes      | The slug of the component to render a table for
| example   | ReactElement | yes | An example of the component to render
