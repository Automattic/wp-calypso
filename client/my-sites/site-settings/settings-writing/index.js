import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
	render as clientRender,
} from 'calypso/controller';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';

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
		siteSettings,
		makeLayout,
		clientRender
	);

	page( '/settings/taxonomies/:taxonomy', siteSelection, sites, makeLayout, clientRender );

	page(
		'/settings/taxonomies/:taxonomy/:site_id',
		siteSelection,
		redirectIfDuplicatedView,
		setScroll,
		makeLayout,
		clientRender
	);
}
