import '@automattic/calypso-polyfills';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import RenderDom from 'react-dom';
import Main from 'calypso/components/main';
import InvalidActionPage from './invalid-action';
import RegistrantVerificationPage from './registrant-verification';
import TransferAwayConfirmationPage from './transfer-away-confirmation';

import 'calypso/assets/stylesheets/style.scss';
import './style.scss';

class DomainsLandingPage extends Component {
	static propTypes = {
		action: PropTypes.string.isRequired,
		query: PropTypes.object.isRequired,
	};

	renderRegistrantVerificationContent() {
		const { domain, email, token } = this.props.query;
		return <RegistrantVerificationPage domain={ domain } email={ email } token={ token } />;
	}

	renderTransferAwayConfirmation() {
		const { domain, recipient_id, token } = this.props.query;
		return (
			<TransferAwayConfirmationPage
				domain={ domain }
				recipientId={ recipient_id }
				token={ token }
			/>
		);
	}

	renderUnknownActionContent() {
		return <InvalidActionPage />;
	}

	renderContent() {
		switch ( this.props.action ) {
			case 'registrant-verification':
				return this.renderRegistrantVerificationContent();

			case 'transfer-away-confirmation':
				return this.renderTransferAwayConfirmation();

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
