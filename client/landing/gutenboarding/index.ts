/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { main, redirectIfNotEnabled } from './controller';
import { render as clientRender } from '../../controller/index.web';
import { wpDataDebugMiddleware } from './devtools';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
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
