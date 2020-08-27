/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class SubscriptionsBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Subscription Form';
	}
	static get blockName() {
		return 'jetpack/subscriptions';
	}
}

export { SubscriptionsBlockComponent };
