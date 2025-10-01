import page from '@automattic/calypso-router';
import { makeLayout, redirectIfDuplicatedView, render as clientRender } from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';

export default function () {
	page(
		'/settings/reading/:site_id',
		siteSelection,
		redirectIfDuplicatedView( 'options-reading.php' ),
		makeLayout,
		clientRender
	);
}
