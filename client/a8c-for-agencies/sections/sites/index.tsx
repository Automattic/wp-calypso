import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesContext, sitesFavoriteContext } from './controller';

export default function () {
	page( '/sites', sitesContext, makeLayout, clientRender );
	page( '/sites/favorite', sitesFavoriteContext, makeLayout, clientRender );
}
