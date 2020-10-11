/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class SubscriptionsBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Subscription Form';
	static blockName = 'jetpack/subscriptions';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-subscriptions' );
}

export { SubscriptionsBlockComponent };
