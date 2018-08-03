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
	state = {
		currentLocale: 'en',
	};

	checkAndLoad() {
		// is moment set to the current locale?
		if ( this.props.currentLocale === moment.locale() ) {
			return;
		}
		if ( this.props.currentLocale !== 'en' ) {
			const loadingLocale = this.props.currentLocale;
			import( /* webpackChunkName: "moment-locale-[request]", webpackInclude: /\.js$/ */ `moment/locale/${ loadingLocale }` ).then(
				() => {
					moment.locale( loadingLocale );
					this.setState( { currentLocale: loadingLocale } );
				}
			);
		} else {
			moment.locale( 'en' );
			this.setState( { currentLocale: 'en' } );
		}
	}

	componentDidMount() {
		this.checkAndLoad();
	}

	componentDidUpdate() {
		this.checkAndLoad();
	}

	render() {
		return <Provider value={ this.state.currentLocale }>{ this.props.children }</Provider>;
	}
}

const ConnectedMomentProvider = connect( state => ( {
	currentLocale: getCurrentLocaleSlug( state ),
} ) )( MomentProvider );

export { ConnectedMomentProvider as MomentProvider, Consumer as MomentConsumer };
