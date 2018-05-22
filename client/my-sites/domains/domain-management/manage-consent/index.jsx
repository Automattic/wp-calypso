/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import Button from 'components/button';
import { domainManagementContactsPrivacy } from 'my-sites/domains/paths';
import { getSelectedDomain } from 'lib/domains';
import SectionHeader from 'components/section-header';
import { requestGdprConsentManagement } from 'lib/upgrades/actions';

class ManageConsent extends React.Component {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		submitting: false,
		error: null,
		success: false,
	};

	render() {
		const { translate } = this.props;

		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToContactsPrivacy } />;
		}

		return (
			<Main className="manage-consent">
				<Header
					onClick={ this.goToContactsPrivacy }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ translate( 'Manage Personal Data Use' ) }
				</Header>
				{ this.state.error && (
					<Notice status="is-error" icon="notice" onDismissClick={ this.dismissError }>
						{ this.state.error }
					</Notice>
				) }
				{ this.state.success && (
					<Notice status="is-success" icon="checkmark" showDismiss={ false }>
						{ translate(
							'Consent management link was successfully sent to the domain owners email'
						) }
					</Notice>
				) }
				<div>
					<SectionHeader label={ translate( 'Manage Personal Data Use' ) } />
					<Card>
						<div>
							<p>
								{ translate(
									'You can manage how your personal data is used ' +
										'using the consent management link you have received via email.'
								) }
							</p>
							<p>
								{ translate(
									'You can request the link again by clicking on ' + 'the button below.'
								) }
							</p>
							<Button
								className="manage-consent__action-button"
								onClick={ this.requestConsentManagementLink }
								primary
								disabled={ this.state.submitting }
							>
								{ translate( 'Request Consent Management Link' ) }
							</Button>
						</div>
					</Card>
				</div>
			</Main>
		);
	}

	isDataLoading = () => {
		return ! getSelectedDomain( this.props );
	};

	dismissError = () => {
		this.setState( { error: null } );
	};

	requestConsentManagementLink = () => {
		this.setState( { submitting: true } );
		requestGdprConsentManagement( this.props.selectedDomainName, error => {
			if ( error ) {
				this.setState( { error: error.message, success: false, submitting: false } );
			} else {
				this.setState( { error: null, success: true, submitting: false } );
			}
		} );
	};

	goToContactsPrivacy = () => {
		page(
			domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName )
		);
	};
}

export default localize( ManageConsent );
