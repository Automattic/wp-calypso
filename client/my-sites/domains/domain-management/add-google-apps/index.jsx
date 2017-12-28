/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import Header from 'client/my-sites/domains/domain-management/components/header';
import AddEmailAddressesCard from './add-email-addresses-card';
import paths from 'client/my-sites/domains/paths';
import { hasGoogleAppsSupportedDomain } from 'client/lib/domains';
import SectionHeader from 'client/components/section-header';
import EmailVerificationGate from 'client/components/email-verification/email-verification-gate';

class AddGoogleApps extends React.Component {
	componentDidMount() {
		this.ensureCanAddEmail();
	}

	componentDidUpdate() {
		this.ensureCanAddEmail();
	}

	ensureCanAddEmail() {
		const needsRedirect =
			this.props.domains.hasLoadedFromServer &&
			! hasGoogleAppsSupportedDomain( this.props.domains.list );

		if ( needsRedirect ) {
			const path = paths.domainManagementEmail(
				this.props.selectedSite.slug,
				this.props.selectedDomainName
			);

			page.replace( path );
		}
	}

	render() {
		const { translate } = this.props;

		return (
			<Main>
				<Header onClick={ this.goToEmail } selectedDomainName={ this.props.selectedDomainName }>
					{ translate( 'Add G Suite' ) }
				</Header>

				<EmailVerificationGate
					noticeText={ translate( 'You must verify your email to purchase G Suite.' ) }
					noticeStatus="is-info"
				>
					<SectionHeader label={ translate( 'Add G Suite' ) } />
					<AddEmailAddressesCard
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
					/>
				</EmailVerificationGate>
			</Main>
		);
	}

	goToEmail = () => {
		const path = paths.domainManagementEmail(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		);

		page( path );
	};
}

export default localize( AddGoogleApps );
