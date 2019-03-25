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

const debug = debugFactory( 'calypso:localized-moment' );

const MomentContext = React.createContext( moment );

class MomentProvider extends React.Component {
	state = { moment, momentLocale: moment.locale() };

	async checkAndLoad() {
		const { currentLocale } = this.props;

		// has the requested locale changed?
		if ( currentLocale === this.state.momentLocale ) {
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
		this.checkAndLoad();
	}

	componentDidUpdate() {
		this.checkAndLoad();
	}

	render() {
		return (
			<MomentContext.Provider value={ this.state }>{ this.props.children }</MomentContext.Provider>
		);
	}
}

const ConnectedMomentProvider = connect( state => ( {
	currentLocale: getCurrentLocaleSlug( state ),
} ) )( MomentProvider );

export { ConnectedMomentProvider as MomentProvider, MomentContext };
