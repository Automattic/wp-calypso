/**
 * External dependencies
 */
import React, { Component } from 'react';
import RenderDom from 'react-dom';
import PropTypes from 'prop-types';
import i18n, { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Main from 'components/main';
import wp from 'lib/wp';

/**
 *
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

class RegistrantVerificationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	state = {
		isVerifying: true,
		success: false,
		error: false,
	};

	componentWillMount() {
		const { domain, token } = this.props;
		wpcom.domainsVerifyRegistrantEmail( domain, token ).then(
			data => {
				this.setState( {
					success: data.success,
					isVerifying: false,
				} );
			},
			error => {
				this.setState( {
					error: { code: error.error, message: error.message },
					isVerifying: false,
				} );
			}
		);
	}

	renderVerificationInProgress = () => {
		return <p>Verifying...</p>;
	};

	renderVerificationSuccess = () => {
		return <p>{ translate( 'Email address verified successfully.' ) }</p>;
	};

	renderVerificationError = () => {
		return <p>{ this.state.error.message }</p>;
	};

	renderVerificationStatus = () => {
		if ( this.state.isVerifying ) {
			return this.renderVerificationInProgress();
		}

		if ( this.state.success ) {
			return this.renderVerificationSuccess();
		}

		if ( this.state.error ) {
			return this.renderVerificationError();
		}
	};

	render() {
		return (
			<Main className="registrant-verification">
				<CompactCard>
					<h2>{ translate( 'Domain Contact Information Verification' ) }</h2>
				</CompactCard>
				<CompactCard>{ this.renderVerificationStatus() }</CompactCard>
			</Main>
		);
	}
}

function getUrlParameter( name ) {
	name = name.replace( /[[]/, '\\[' ).replace( /[\]]/, '\\]' );
	const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
	const results = regex.exec( location.search );
	return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
}

/**
 * Default export. Boots up the landing page.
 */
function boot() {
	const token = getUrlParameter( 'token' );
	const domain = getUrlParameter( 'domain' );
	if ( window.i18nLocaleStrings ) {
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		i18n.setLocale( i18nLocaleStringsObject );
	}
	RenderDom.render(
		<RegistrantVerificationPage token={ token } domain={ domain } />,
		document.getElementById( 'primary' )
	);
}

boot();
