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
import AddEmailAddressesCard from 'my-sites/domains/domain-management/add-google-apps/add-email-addresses-card';
import { domainManagementEmail } from 'my-sites/domains/paths';
import DomainManagementHeader from 'my-sites/domains/domain-management/components/header';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { hasGoogleAppsSupportedDomain } from 'lib/domains';
import Main from 'components/main';
import SectionHeader from 'components/section-header';

class GSuiteAddUsers extends React.Component {
	componentDidMount() {
		this.redirectIfCannotAddEmail();
	}

	componentDidUpdate() {
		this.redirectIfCannotAddEmail();
	}

	redirectIfCannotAddEmail() {
		const { domains, isRequestingSiteDomains } = this.props;
		const gsuiteSupportedDomain = hasGoogleAppsSupportedDomain( domains );
		if ( isRequestingSiteDomains || gsuiteSupportedDomain ) {
			return;
		}
		this.goToEmail();
	}

	goToEmail = () => {
		page( domainManagementEmail( this.props.selectedSite.slug, this.props.selectedDomainName ) );
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
				<DomainManagementHeader
					onClick={ this.goToEmail }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ translate( 'Add G Suite' ) }
				</DomainManagementHeader>

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

GSuiteAddUsers.propTypes = {
	domains: PropTypes.array.isRequired,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( GSuiteAddUsers );
