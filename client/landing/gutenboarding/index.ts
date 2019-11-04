/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import user from 'lib/user';
import { main, redirectIfNotEnabled } from './controller';
import { render as clientRender } from 'controller';
import { wpDataDebugMiddleware } from './devtools';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = async () => {
	await user().initialize();
	page(
		'/gutenboarding',
		redirectIfNotEnabled,
		wpDataDebugMiddleware,
		main,
		// No `makeLayout` here, to avoid rendering the `Layout` component (which includes the masterbar)
		clientRender
	);
	page.start();
};
