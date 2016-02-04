/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { getRouting, selectFactory, selectProps } from './routing';

const user = userFactory();

export default function() {
	if ( config.isEnabled( 'manage/themes' ) ) {
		const { routes, middlewares } = getRouting( !! user.get() );
		const handlers = [ ...middlewares, ( context ) => {
			const factory = selectFactory( context );
			const props = selectProps( context );
			render( factory( props ) );
		} ];

		routes.forEach( route => page( route, ...handlers ) );
	}
}

function render( ui ) {
	ReactDom.render( ui, document.getElementById( 'primary' ) );
}
