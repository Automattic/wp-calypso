import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { taxonomies, writing } from './controller';

const redirectIfDuplicatedView = ( context, next ) => {
	_redirectIfDuplicatedView( `edit-tags.php?taxonomy=${ context.params.taxonomy }` )(
		context,
		next
	);
};

export default function () {
	page(
		'/settings/writing/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		writing,
		makeLayout,
		clientRender
	);

	page( '/settings/taxonomies/:taxonomy', siteSelection, sites, makeLayout, clientRender );

	page(
		'/settings/taxonomies/:taxonomy/:site_id',
		siteSelection,
		redirectIfDuplicatedView,
		navigation,
		setScroll,
		taxonomies,
		makeLayout,
		clientRender
	);
}
