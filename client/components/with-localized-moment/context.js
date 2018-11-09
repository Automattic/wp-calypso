/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

const debug = debugFactory( 'calypso:with-localized-moment' );

const { Provider, Consumer } = React.createContext( moment );

class MomentProvider extends React.Component {
	state = { moment, momentLocale: 'en' };

	async checkAndLoad( previousLocale ) {
		const { currentLocale } = this.props;

		// has the requested locale changed?
		if ( currentLocale === previousLocale ) {
			return;
		}

		if ( currentLocale === 'en' ) {
			// always pre-loaded, expose a promise that resolves immediately
			this.loadingLocalePromise = Promise.resolve();
		} else {
			debug( 'Loading moment locale for %s', currentLocale );
			try {
				// expose the import load promise as instance property. Useful for tests that wait for it
				this.loadingLocalePromise = import( /* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ currentLocale }` );
				await this.loadingLocalePromise;
			} catch ( error ) {
				debug( 'Failed to load moment locale for %s', currentLocale, error );
				return;
			}
			debug( 'Loaded moment locale for %s', currentLocale );
		}

		if ( moment.locale() !== currentLocale ) {
			moment.locale( currentLocale );
		}
		this.setState( { momentLocale: currentLocale } );
	}

	componentDidMount() {
		this.checkAndLoad( 'en' );
	}

	componentDidUpdate( prevProps ) {
		this.checkAndLoad( prevProps.currentLocale );
	}

	render() {
		return <Provider value={ this.state }>{ this.props.children }</Provider>;
	}
}

const ConnectedMomentProvider = connect( state => ( {
	currentLocale: getCurrentLocaleSlug( state ),
} ) )( MomentProvider );

export { ConnectedMomentProvider as MomentProvider, Consumer as MomentConsumer };
