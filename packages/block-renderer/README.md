# Block Renderer

Render blocks on the client side

## Usage

```jsx
import { BlockRendererProvider, PatternsRendererProvider, PatternsRenderer } from '@automattic/block-renderer';

const PatternsPreview = () => (
	<BlockRendererProvider
		siteId={ siteId }
		stylesheet={ stylesheet }
	>
		<PatternsRendererProvider
			siteId={ siteId }
			stylesheet={ stylesheet }
			patternIds={ patternIds }
		>
			<PatternsRenderer patternIds={ patternIds } />
		</PatternsRendererProvider>
	</BlockRendererProvider>
);
```

## Components

### BlockRendererProvider

Initialize the settings of the block renderer. It will fetch the settings from an endpoint and store them in the `blockEditorStore`

### BlockRendererContainer

Render the iframe to control the styles of block, and you can pass any blocks you want to render to its children

### PatternsRendererProvider

Initialize the provided pattern ids. It will fetch the rendered html of each pattern, and store them in the `PatternsRendererContext`.

Note that it fetches 20 patterns per request to avoid any potential performance issues.

### PatternRenderer

Render the pattern by the provided pattern id.
