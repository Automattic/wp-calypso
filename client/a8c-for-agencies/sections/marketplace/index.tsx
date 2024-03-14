import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	assignLicenseContext,
	marketplaceContext,
	marketplaceHostingContext,
	marketplaceProductsContext,
} from './controller';

export default function () {
	page( '/marketplace', marketplaceContext, makeLayout, clientRender );
	page( '/marketplace/products', marketplaceProductsContext, makeLayout, clientRender );
	page( '/marketplace/hosting', marketplaceHostingContext, makeLayout, clientRender );
	page( '/marketplace/assign-license', assignLicenseContext, makeLayout, clientRender );
}
