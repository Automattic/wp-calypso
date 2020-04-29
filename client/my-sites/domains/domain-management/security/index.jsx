/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { CompactCard } from '@automattic/components';
import MaterialIcon from 'components/material-icon';
import { getSelectedDomain } from 'lib/domains';

import './style.scss';

const SSL_DISABLED = 'disabled';
const SSL_PROVISIONING = 'provisioning';
const SSL_ACTIVE = 'active';

class Security extends React.Component {
	header() {
		return (
			<Header onClick={ this.back } selectedDomainName={ this.props.selectedDomainName }>
				{ this.props.translate( 'Domain security' ) }
			</Header>
		);
	}

	back = () => {
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	isLoading() {
		return this.props.isRequestingSiteDomains;
	}

	getSSLStatus( domain ) {
		const { expired, sslProvisioning } = domain;

		if ( expired ) {
			return SSL_DISABLED;
		}

		if ( sslProvisioning ) {
			return SSL_PROVISIONING;
		}

		return SSL_ACTIVE;
	}

	getSSLStatusIcon( domain ) {
		const { translate } = this.props;

		const sslStatus = this.getSSLStatus( domain );
		let icon, text;

		switch ( sslStatus ) {
			case SSL_PROVISIONING:
				text = translate( 'Provisioning' );
				break;
			case SSL_ACTIVE:
				icon = 'check_circle';
				text = translate( 'Enabled' );
				break;
			case SSL_DISABLED:
				icon = 'info';
				text = translate( 'Disabled' );
				break;
		}

		const statusClassNames = classNames( 'security__status', sslStatus );

		return (
			<span className={ statusClassNames }>
				{ icon && <MaterialIcon icon={ icon } /> }
				{ text }
			</span>
		);
	}

	getContent() {
		const { translate } = this.props;
		const domain = this.props.domains && getSelectedDomain( this.props );

		if ( ! domain ) {
			return null;
		}

		return (
			<React.Fragment>
				<CompactCard className="security__header">
					<span>{ translate( 'HTTPS encryption' ) }</span>
					{ this.getSSLStatusIcon( domain ) }
				</CompactCard>
				<CompactCard className="security__content">
					<p>
						{ translate(
							'Strong encryption is critical to ensure the privacy and security of your site. This is what you get with HTTPS encryption on WordPress.com:'
						) }
					</p>
					<ul>
						{ [
							translate( 'Trust indicators that reassure your visitors your site is safe ' ),
							translate( 'Secure data transmissoin of data sent through forms' ),
							translate( 'Safe shopping experience with secure payments' ),
							translate( 'Protection against hackers trying to mimic your site' ),
							translate( 'Improved Google search rankings' ),
							translate( '301 redirects for all HTTP requests to HTTPS' ),
						].map( ( feature, index ) => (
							<li key={ index }>{ feature }</li>
						) ) }
					</ul>
				</CompactCard>
			</React.Fragment>
		);
	}

	render() {
		const classes = classNames( 'security', {
			'is-placeholder': this.isLoading(),
		} );

		return (
			<Main className={ classes }>
				{ this.header() }
				{ this.getContent() }
			</Main>
		);
	}
}

export default localize( Security );
