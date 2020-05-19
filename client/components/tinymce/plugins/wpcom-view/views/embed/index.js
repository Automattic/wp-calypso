/**
 * External dependencies
 */
import EventEmitter from 'events';

/**
 * Internal dependencies
 */
import EmbedView from './view';
import getCurrentSiteEmbeds from 'state/selectors/get-current-site-embeds';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getReduxStore, reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { requestEmbeds } from 'state/embeds/actions';

export default class EmbedViewManager extends EventEmitter {
	constructor() {
		super();

		getReduxStore().then( ( store ) => {
			store.subscribe(
				this.createListener( store, getSelectedSiteId, this.onChange.bind( this ) )
			);
			store.subscribe(
				this.createListener( store, getCurrentSiteEmbeds, this.onChange.bind( this ) )
			);
		} );
	}

	onChange() {
		this.emit( 'change' );
	}

	createListener( store, selector, callback ) {
		let prevValue = selector( store.getState() );
		return () => {
			const nextValue = selector( store.getState() );

			if ( nextValue !== prevValue ) {
				prevValue = nextValue;
				callback( nextValue );
			}
		};
	}

	match( content ) {
		const siteId = getSelectedSiteId( reduxGetState() );
		if ( ! siteId ) {
			return;
		}

		const embeds = getCurrentSiteEmbeds( reduxGetState() );
		if ( ! embeds ) {
			reduxDispatch( requestEmbeds( siteId ) );
			return;
		}

		const rxLink = /(^|<p>)(https?:\/\/[^\s"]+?)(<\/p>\s*|$)/gi;
		let currentMatch;
		while ( ( currentMatch = rxLink.exec( content ) ) ) {
			const url = currentMatch[ 2 ];

			// Disregard URL if it's not a supported embed pattern for the site
			const isMatchingPattern = embeds.some( ( pattern ) => pattern.test( url ) );
			if ( ! isMatchingPattern ) {
				continue;
			}

			return {
				index: currentMatch.index + currentMatch[ 1 ].length,
				content: url,
			};
		}
	}

	serialize( content ) {
		return encodeURIComponent( content );
	}

	getComponent() {
		return EmbedView;
	}

	edit( editor, content ) {
		editor.execCommand( 'embedDialog', content );
	}
}
