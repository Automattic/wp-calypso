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
	state = { moment, locale: 'en' };

	async checkAndLoad() {
		const { currentLocale } = this.props;

		// is moment set to the current locale?
		if ( currentLocale === moment.locale() ) {
			return;
		}

		if ( currentLocale !== 'en' ) {
			debug( 'Loading moment locale for %s', currentLocale );
			try {
				await import( /* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ currentLocale }` );
			} catch ( e ) {
				debug( 'Failed to load moment locale for %s', currentLocale );
				return;
			}
			debug( 'Loaded moment locale for %s', currentLocale );
		}

		moment.locale( currentLocale );
		this.setState( {
			moment,
			locale: currentLocale,
		} );
	}

	componentDidMount() {
		this.checkAndLoad();
	}

	componentDidUpdate() {
		this.checkAndLoad();
	}

	render() {
		return <Provider value={ this.state }>{ this.props.children }</Provider>;
	}
}

const ConnectedMomentProvider = connect( state => ( {
	currentLocale: getCurrentLocaleSlug( state ),
} ) )( MomentProvider );

export { ConnectedMomentProvider as MomentProvider, Consumer as MomentConsumer };
