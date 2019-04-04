/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RenderDom from 'react-dom';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RegistrantVerificationPage from './registrant-verification';
import InvalidActionPage from './invalid-action';
import Main from 'components/main';

/**
 *
 * Style dependencies
 */
import './style.scss';

class DomainsLandingPage extends Component {
	static propTypes = {
		action: PropTypes.string.isRequired,
	};

	getUrlParameter( name ) {
		name = name.replace( /[[]/, '\\[' ).replace( /[\]]/, '\\]' );
		const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
		const results = regex.exec( location.search );
		return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
	}

	renderRegistrantVerificationContent() {
		const token = this.getUrlParameter( 'token' );
		const domain = this.getUrlParameter( 'domain' );
		const email = this.getUrlParameter( 'email' );

		return <RegistrantVerificationPage domain={ domain } email={ email } token={ token } />;
	}

	renderUnknownActionContent() {
		return <InvalidActionPage />;
	}

	renderContent() {
		switch ( this.props.action ) {
			case 'registrant-verification':
				return this.renderRegistrantVerificationContent();

			case 'unknown-action':
			default:
				return this.renderUnknownActionContent();
		}
	}

	render() {
		return <Main className="domains">{ this.renderContent() }</Main>;
	}
}

/**
 * Default export. Boots up the landing page.
 */
function boot() {
	if ( window.i18nLocaleStrings ) {
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		i18n.setLocale( i18nLocaleStringsObject );
	}

	RenderDom.render(
		<DomainsLandingPage action={ window.domainsLandingData.action } />,
		document.getElementById( 'primary' )
	);
}

boot();
