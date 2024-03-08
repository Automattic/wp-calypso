import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedDomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class ManageConsent extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
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
			return <DomainMainPlaceholder />;
		}

		return (
			<Main className="manage-consent">
				<Header
					onClick={ this.goToContactsPrivacy }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ translate( 'Manage Consent for Personal Data Use' ) }
				</Header>
				{ this.state.error && (
					<Notice status="is-error" icon="notice" onDismissClick={ this.dismissError }>
						{ translate(
							'An error occured while sending you the Personal Data Consent Link. ' +
								'If the issue persists please contact our support staff.'
						) }
					</Notice>
				) }
				{ this.state.success && (
					<Notice status="is-success" icon="checkmark" showDismiss={ false }>
						{ translate(
							'Personal Data Consent Link was successfully sent to the domain owner email.'
						) }
					</Notice>
				) }
				<div>
					<SectionHeader label={ translate( 'Manage Consent for Personal Data Use' ) } />
					<Card>
						<div>
							<p>
								{ translate(
									'You can view or change your consent for how we use or share personally identifiable data related to your domain registration at any time.'
								) }
							</p>
							<p>
								{ translate(
									'Click the button below to receive an email with a unique link to manage your consent options. Please note that this email will be sent to the registrant contact email address, which may be different than your WordPress.com account email address.'
								) }
							</p>
							<Button
								className="manage-consent__action-button"
								onClick={ this.requestConsentManagementLink }
								primary
								disabled={ this.state.submitting }
							>
								{ translate( 'Request Consent Management Email' ) }
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
		wpcom.req
			.get( `/domains/${ this.props.selectedDomainName }/request-gdpr-consent-management-link` )
			.then( () => {
				this.setState( { error: null, success: true, submitting: false } );
			} )
			.catch( ( error ) => {
				this.setState( { error: error.message, success: false, submitting: false } );
			} );
	};

	goToContactsPrivacy = () => {
		page(
			domainManagementEdit(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};
}

export default connect( ( state ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( localize( ManageConsent ) );
