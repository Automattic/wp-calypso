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

import './style.scss';

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

	getContent() {
		const { translate } = this.props;

		return (
			<React.Fragment>
				<CompactCard className="security__header">
					<span>{ translate( 'HTTPS encryption' ) }</span>
					<span className="security__status">
						<MaterialIcon icon="check_circle" />
						{ translate( 'Enabled' ) }
					</span>
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
						].map( ( feature ) => (
							<li>{ feature }</li>
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
