import {
	makeLayout,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
} from 'calypso/controller';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import { list } from './controller';

const redirectIfDuplicatedView = ( context, next ) => {
	_redirectIfDuplicatedView( `edit.php?post_type=${ context.params.type }` )( context, next );
};

export default function ( router ) {
	router(
		'/types/:type/:status?/:site',
		siteSelection,
		redirectIfDuplicatedView,
		navigation,
		list,
		makeLayout
	);
	router( '/types/:type', siteSelection, redirectIfDuplicatedView, sites, makeLayout );
	router( '/types', '/posts' );
}
