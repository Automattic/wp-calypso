/**
 * External Dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import * as controller from './controller';
import * as paths from './paths';
import { sidebar } from 'me/controller';

export default function() {
	page(
		paths.addCreditCard(),
		sidebar,
		controller.addCreditCard
	);
}
