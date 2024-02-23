import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { assignLicenseContext, marketplaceContext } from './controller';

export default function () {
	page( '/marketplace', marketplaceContext, makeLayout, clientRender );
	page( '/marketplace/assign-license', assignLicenseContext, makeLayout, clientRender );
}
