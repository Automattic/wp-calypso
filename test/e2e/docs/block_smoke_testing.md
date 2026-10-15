[← Documentation index](./overview.md)

# Block Smoke Testing

## Overview

The in-depth testing for a given Gutenberg block should be written and executed in the source
repo for that block (e.g. Jetpack, Gutenberg, Newspack).

However, it is often valuable to perform a very basic smoke test on blocks to ensure they
function as intended in the WPCOM and Calypso environment. For consistency and ease of test
writing and maintenance, all of this block testing is done in a shared format, where the same
basic flow is iterated over all the blocks under test.

With a few exceptions (like media blocks), block smoke tests should be grouped together
according to the _source_ of the block. E.g. all the blocks from Newspack should be in the same
spec, all of the core Gutenberg blocks should be in the same spec, and so on. This allows for
granular test execution when those sources are updated and the new versions are included in
WPCOM.

## How to

1. Create a class implementing the `BlockFlow` interface, defined in
   [`calypso-e2e/src/lib/blocks/block-flows/types.ts`](../../../packages/calypso-e2e/src/lib/blocks/block-flows/types.ts),
   in [`calypso-e2e/src/lib/blocks/block-flows`](../../../packages/calypso-e2e/src/lib/blocks/block-flows).
2. Export it from `block-flows/index.ts`, otherwise it is not available from the test project.
3. By convention, any test data needed to configure or validate the block is passed to the
   constructor as a single object, typed locally with an interface called `ConfigurationData`.
4. In the spec file, instantiate the block flows you want in that spec and pass the array to
   `createBlockTests`, found in
   [`specs/blocks/shared/block-smoke-testing.ts`](../specs/blocks/shared/block-smoke-testing.ts).

`configure` and `validateAfterPublish` are both optional. `createBlockTests` adds every block
to one post, checks the editor reports no block warnings, publishes once, then runs each
flow's validation against the published post.

## Examples

<details>
<summary>Block flow class:</summary>

```typescript
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedVideoTitle: string;
}

const blockParentSelector = '[aria-label*="Block: YouTube"]:has-text("YouTube")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	publishedYouTubeIframe: 'iframe.youtube-player',
};

/**
 * Class representing the flow of using a YouTube block in the editor.
 */
export class YouTubeBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'YouTube Embed';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor.
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		await editorCanvas.locator( selectors.embedUrlInput ).fill( this.configurationData.embedUrl );
		await editorCanvas.locator( selectors.embedButton ).click();
	}

	/**
	 * Validate the block in the published post.
	 *
	 * @param context The current context for the published post at the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const iframe = context.page.frameLocator( selectors.publishedYouTubeIframe );

		await iframe
			.getByRole( 'link', { name: this.configurationData.expectedVideoTitle } )
			.waitFor();
	}
}
```

</details>

<details>
<summary>Spec test file:</summary>

```typescript
import { BlockFlow, DataHelper, LayoutGridBlockFlow, YouTubeBlockFlow } from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new YouTubeBlockFlow( {
		embedUrl: 'https://www.youtube.com/watch?v=twGLN4lug-I',
		expectedVideoTitle: 'Getting started on @wordpressdotcom',
	} ),
	new LayoutGridBlockFlow( {
		leftColumnText: DataHelper.getRandomPhrase(),
		rightColumnText: DataHelper.getRandomPhrase(),
	} ),
];

createBlockTests( 'Blocks: Core', blockFlows, [ tags.GUTENBERG ] );
```

</details>
