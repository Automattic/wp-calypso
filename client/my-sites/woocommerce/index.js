/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { makeLayout } from 'calypso/controller';
import { checkPrerequisites, setup } from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout );
	router(
		'/woocommerce-installation/:site',
		siteSelection,
		navigation,
		checkPrerequisites,
		setup,
		makeLayout
	);
}
