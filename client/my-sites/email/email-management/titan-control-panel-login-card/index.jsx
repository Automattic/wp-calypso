/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { Button, CompactCard } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import { getTitanMailOrderId } from 'calypso/lib/titan/get-titan-mail-order-id';

/**
 * Style dependencies
 */
import './style.scss';

class TitanControlPanelLoginCard extends React.Component {
	state = {
		isFetchingAutoLoginLink: false,
		iframeURL: '',
	};

	componentDidMount() {
		this._mounted = true;

		this.fetchTitanIframeURL( getTitanMailOrderId( this.props.domain ) ).then(
			( { error, iframeURL } ) => {
				if ( error ) {
					this.props.errorNotice(
						error ?? this.props.translate( 'An unknown error occurred. Please try again later.' )
					);
				} else {
					this.setState( { iframeURL } );
				}
			}
		);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	fetchTitanAutoLoginURL = ( orderId ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getTitanControlPanelAutoLoginURL( orderId, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					loginURL: serverError ? null : result.auto_login_url,
				} );
			} );
		} );
	};

	fetchTitanIframeURL = ( orderId ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getTitanControlPanelIframeURL( orderId, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					iframeURL: serverError ? null : result.iframe_url,
				} );
			} );
		} );
	};

	onLogInClick = () => {
		if ( this.state.isFetchingAutoLoginLink ) {
			return;
		}

		const { domain, translate } = this.props;
		this.setState( { isFetchingAutoLoginLink: true } );

		this.fetchTitanAutoLoginURL( getTitanMailOrderId( domain ) ).then( ( { error, loginURL } ) => {
			this.setState( { isFetchingAutoLoginLink: false } );
			if ( error ) {
				this.props.errorNotice(
					error ?? translate( 'An unknown error occurred. Please try again later.' )
				);
			} else {
				window.location.href = loginURL;
			}
		} );
	};

	renderAutoLogin() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is a domain name, e.g. example.com',
		};

		return (
			<div className="titan-control-panel-login-card">
				<SectionHeader label={ translate( 'Titan Mail: %(domainName)s', translateArgs ) }>
					<Button
						primary
						compact
						busy={ this.state.isFetchingAutoLoginLink }
						onClick={ this.onLogInClick }
					>
						{ translate( "Log in to Titan's control panel" ) }
					</Button>
				</SectionHeader>
				<CompactCard>
					{ translate(
						"Go to Titan's control panel to manage email for %(domainName)s.",
						translateArgs
					) }
				</CompactCard>
			</div>
		);
	}

	renderIframe() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is a domain name, e.g. example.com',
		};

		return (
			<div className="titan-control-panel-login-card">
				<SectionHeader label={ translate( 'Titan Mail: %(domainName)s', translateArgs ) } />
				<CompactCard>
					{ this.state.iframeURL ? (
						<iframe
							title="Titan Control Panel"
							src={ this.state.iframeURL }
							width="100%"
							height="650px"
						/>
					) : (
						<div>Loading the control panel...</div>
					) }
				</CompactCard>
			</div>
		);
	}

	render() {
		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			return this.renderIframe();
		}

		return this.renderAutoLogin();
	}
}

TitanControlPanelLoginCard.propTypes = {
	domain: PropTypes.object.isRequired,
};

export default connect( null, ( dispatch ) => {
	return {
		errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
	};
} )( localize( TitanControlPanelLoginCard ) );
