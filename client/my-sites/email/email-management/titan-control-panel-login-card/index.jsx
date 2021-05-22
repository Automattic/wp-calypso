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
import { isEnabled } from '@automattic/calypso-config';
import { errorNotice } from 'calypso/state/notices/actions';
import { Button, CompactCard } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import {
	fetchTitanAutoLoginURL,
	fetchTitanIframeURL,
} from 'calypso/my-sites/email/email-management/titan-functions';
import { getTitanMailOrderId, getTitanProductName } from 'calypso/lib/titan';

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

		const { context, domain } = this.props;

		fetchTitanIframeURL( getTitanMailOrderId( domain ), context ).then(
			( { error, iframeURL } ) => {
				if ( error ) {
					this.props.errorNotice(
						error ?? this.props.translate( 'An unknown error occurred. Please try again later.' )
					);
				} else if ( this._mounted ) {
					this.setState( { iframeURL } );
				}
			}
		);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	onLogInClick = () => {
		if ( this.state.isFetchingAutoLoginLink ) {
			return;
		}

		const { context, domain, translate } = this.props;
		this.setState( { isFetchingAutoLoginLink: true } );

		fetchTitanAutoLoginURL( getTitanMailOrderId( domain ), context ).then(
			( { error, loginURL } ) => {
				this.setState( { isFetchingAutoLoginLink: false } );
				if ( error ) {
					this.props.errorNotice(
						error ?? translate( 'An unknown error occurred. Please try again later.' )
					);
				} else {
					window.location.href = loginURL;
				}
			}
		);
	};

	renderAutoLogin() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
				productName: getTitanProductName(),
			},
			comment:
				'%(domainName)s is a domain name, e.g. example.com; %(productName)s is the product name, which should be "Professional Email" translated',
		};
		const sectionHeaderLabel = translate( '%(productName)s: %(domainName)s', translateArgs );
		const buttonCtaText = translate( 'Log in to your %(productName)s control panel', {
			args: { productName: getTitanProductName() },
			comment:
				'%(productName)s is the product name, which will be the translated version of "Professional Email"',
		} );
		const cardText = translate(
			'Go to the %(productName)s control panel to manage email for %(domainName)s.',
			translateArgs
		);

		return (
			<div className="titan-control-panel-login-card">
				<SectionHeader label={ sectionHeaderLabel }>
					<Button
						primary
						compact
						busy={ this.state.isFetchingAutoLoginLink }
						onClick={ this.onLogInClick }
					>
						{ buttonCtaText }
					</Button>
				</SectionHeader>
				<CompactCard>{ cardText }</CompactCard>
			</div>
		);
	}

	renderIframe() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
				productName: getTitanProductName(),
			},
			comment:
				'%(domainName)s is a domain name, e.g. example.com; %(productName)s is the product name, which should be "Professional Email" translated',
		};
		const sectionHeaderLabel = translate( '%(productName)s: %(domainName)s', translateArgs );

		return (
			<div className="titan-control-panel-login-card">
				<SectionHeader label={ sectionHeaderLabel } />
				<CompactCard>
					{ this.state.iframeURL ? (
						<iframe
							title={ translate( '%(titanProductName)s Control Panel', {
								args: {
									titanProductName: getTitanProductName(),
								},
								comment:
									'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
							} ) }
							src={ this.state.iframeURL }
							width="100%"
							height="1200px"
						/>
					) : (
						<div>{ translate( 'Loading the control panel…' ) }</div>
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
	context: PropTypes.string,
	domain: PropTypes.object.isRequired,
};

export default connect( null, ( dispatch ) => {
	return {
		errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
	};
} )( localize( TitanControlPanelLoginCard ) );
