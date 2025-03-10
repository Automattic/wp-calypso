import { BlockFlow } from '.';

const blockParentSelector = '[aria-label="Block: Content Carousel"]';

/**
 * Class representing the flow of using a Newspack Blog Posts block in the editor
 */
export class PostCarouselBlockFlow implements BlockFlow {
	blockSidebarName = 'Content Carousel';
	blockEditorSelector = blockParentSelector;

	// We are very limited in what we can safely smoke test with the Post Carousel block because it is dependent on other posts.
	// There's no guarantee (due to data clean up operations) that there will even be other posts!
	// If there are no posts, the block isn't even rendered in the published post.
	// Because of this, it's best to minimize false positives and just make sure we can...
	// 1. Find and add the block from the sidebar
	// 2. Ensure it can be added to the editor without entering an errored state.
}
