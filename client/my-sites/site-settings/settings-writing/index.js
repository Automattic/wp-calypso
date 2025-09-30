import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { writing } from './controller';

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
		_redirectIfDuplicatedView( 'options-writing.php' ),
		navigation,
		siteSettings,
		writing,
		makeLayout,
		clientRender
	);

	page( '/settings/taxonomies/:taxonomy', siteSelection, sites, makeLayout, clientRender );

	page( '/settings/taxonomies/:taxonomy/:site_id', siteSelection, redirectIfDuplicatedView );
}
