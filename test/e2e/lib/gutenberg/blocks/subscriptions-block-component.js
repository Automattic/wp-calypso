import { By } from 'selenium-webdriver';
import GutenbergBlockComponent from './gutenberg-block-component';

class SubscriptionsBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Subscription Form';
	static blockName = 'jetpack/subscriptions';
	static blockFrontendLocator = By.css( '.entry-content .wp-block-jetpack-subscriptions' );
}

export { SubscriptionsBlockComponent };
