/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

const { Provider, Consumer } = React.createContext( moment );

class MomentProvider extends React.Component {
	state = {};

	async checkAndLoad() {
		const { currentLocale } = this.props;

		// is moment set to the current locale?
		if ( currentLocale === moment.locale() ) {
			return;
		}

		if ( currentLocale !== 'en' ) {
			await import( /* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ currentLocale }` );
		}

		moment.locale( currentLocale );
		this.setState( {} );
	}

	componentDidMount() {
		this.checkAndLoad();
	}

	componentDidUpdate() {
		this.checkAndLoad();
	}

	render() {
		return <Provider value={ moment }>{ this.props.children }</Provider>;
	}
}

const ConnectedMomentProvider = connect( state => ( {
	currentLocale: getCurrentLocaleSlug( state ),
} ) )( MomentProvider );

export { ConnectedMomentProvider as MomentProvider, Consumer as MomentConsumer };
