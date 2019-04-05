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

class DomainsLandingPage extends Component {
	static propTypes = {
		action: PropTypes.string.isRequired,
		query: PropTypes.object.isRequired,
	};

	renderRegistrantVerificationContent() {
		const { domain, email, token } = this.props.query;
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
		<DomainsLandingPage
			action={ window.domainsLandingData.action }
			query={ window.domainsLandingData.query }
		/>,
		document.getElementById( 'primary' )
	);
}

boot();
