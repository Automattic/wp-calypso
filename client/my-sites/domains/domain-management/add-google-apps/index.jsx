/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import AddEmailAddressesCard from './add-email-addresses-card';
import { domainManagementEmail } from 'my-sites/domains/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { hasGoogleAppsSupportedDomain } from 'lib/domains';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import SectionHeader from 'components/section-header';

class AddGoogleApps extends React.Component {
	componentDidMount() {
		this.redirectIfCannotAddEmail();
	}

	componentDidUpdate() {
		this.redirectIfCannotAddEmail();
	}

	redirectIfCannotAddEmail() {
		if ( ! this.canAddEmail() ) {
			this.goToEmail();
		}
	}

	canAddEmail() {
		const { domains, isRequestingSiteDomains } = this.props;
		const gsuiteSupportedDomain = hasGoogleAppsSupportedDomain( domains );
		return isRequestingSiteDomains || gsuiteSupportedDomain;
	}

	goToEmail = () => {
		const path = domainManagementEmail(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		);
		page( path );
	};

	renderAddGSuite() {
		const {
			domains,
			isRequestingSiteDomains,
			selectedDomainName,
			selectedSite,
			translate,
		} = this.props;

		return (
			<Fragment>
				<SectionHeader label={ translate( 'Add G Suite' ) } />
				<AddEmailAddressesCard
					domains={ domains }
					isRequestingSiteDomains={ isRequestingSiteDomains }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
			</Fragment>
		);
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
					{ this.renderAddGSuite() }
				</EmailVerificationGate>
			</Main>
		);
	}
}

AddGoogleApps.propTypes = {
	domains: PropTypes.array.isRequired,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( AddGoogleApps );
