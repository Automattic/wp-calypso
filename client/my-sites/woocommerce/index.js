import { makeLayout } from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { setup } from './controller';

import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout );
	router( '/woocommerce-installation/:site', siteSelection, navigation, setup, makeLayout );
}
