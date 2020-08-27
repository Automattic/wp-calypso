/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class BlogPostsBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Blog Posts';
	}
	static get blockName() {
		return 'a8c/blog-posts';
	}
}

export { BlogPostsBlockComponent };
