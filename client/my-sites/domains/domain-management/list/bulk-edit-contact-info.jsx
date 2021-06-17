/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { debounce, isEmpty, merge } from 'lodash';

/**
 * Internal dependencies
 */
import DomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/components/domain-contact-details';
import { Button } from '@automattic/components';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import isRequestingContactDetailsCache from 'calypso/state/selectors/is-requesting-contact-details-cache';
import { requestContactDetailsCache, saveWhois } from 'calypso/state/domains/management/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import {
	getWhoisSaveError,
	getWhoisSaveSuccess,
	isUpdatingWhois,
} from 'calypso/state/domains/management/selectors';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { DESIGNATED_AGENT, DOMAIN_REGISTRATION_AGREEMENTS } from 'calypso/lib/url/support';

import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

/**
 * Style dependencies
 */
import './list-all.scss';
import FormLabel from 'calypso/components/forms/form-label';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'calypso/lib/url/support';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';

class BulkEditContactInfo extends React.Component {
	static propTypes = {
		domainNamesList: PropTypes.array.isRequired,
	};

	state = {
		isLoadingUserSettings: false,
		hasLoadedContactDetails: false,
		contactDetails: {},
		errorMessages: {},
	};

	componentDidMount() {
		if ( isEmpty( this.props.userSettings ) ) {
			this.props.fetchUserSettings();
		}

		if ( isEmpty( this.props.contactDetailsCache ) ) {
			this.props.requestContactDetailsCache();
		}

		this.debouncedValidateContactDetails = debounce( this.validateContactDetails, 500 );
	}

	componentDidUpdate() {
		const email = ! isEmpty( this.props.userSettings?.new_user_email )
			? this.props.userSettings?.new_user_email
			: this.props.userSettings?.user_email;

		if ( ! isEmpty( email ) && isEmpty( this.state.contactDetails?.email ) ) {
			this.updateDomainContactFields( { email: email } );
		}

		if (
			! isEmpty( this.props.contactDetailsCache ) &&
			false === this.state.hasLoadedContactDetails
		) {
			this.setContactDetailsFromCache( this.props.contactDetailsCache );
		}
	}

	isLoading() {
		return isEmpty( this.props.contactDetailsCache ) || this.props.isRequestingContactDetailsCache;
	}

	setContactDetailsFromCache = ( data ) => {
		delete data.email;
		this.setState( { hasLoadedContactDetails: true }, () => {
			this.updateDomainContactFields( data );
		} );
	};

	updateDomainContactFields = ( data ) => {
		const newContactDetails = merge( {}, this.state.contactDetails, data );
		this.setState( { contactDetails: newContactDetails } );
		! isEmpty( newContactDetails ) && this.debouncedValidateContactDetails( newContactDetails );
	};

	submit = () => {
		console.log( this.props.domainNamesList );
		console.log( this.state.contactDetails );
	};

	validateContactDetails = ( contactDetails ) => {
		wpcom.validateDomainContactInformation( contactDetails, [], ( error, data ) => {
			this.setState( {
				errorMessages: ( data && data.messages ) || {},
			} );
		} );
	};

	renderTransferLockOptOut() {
		const { domainRegistrationAgreementUrl, translate } = this.props;
		return (
			<div>
				<FormLabel>
					<FormCheckbox
						name="transfer-lock-opt-out"
						disabled={ this.state.formSubmitting }
						onChange={ this.onTransferLockOptOutChange }
					/>
					<span>
						{ translate( 'Opt-out of the {{link}}60-day transfer lock{{/link}}.', {
							components: {
								link: (
									<a
										href={ UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</span>
				</FormLabel>
				<DesignatedAgentNotice
					domainRegistrationAgreementUrl={ domainRegistrationAgreementUrl }
					saveButtonLabel={ translate( 'Save contact info' ) }
				/>
			</div>
		);
	}

	render() {
		const { contactDetails, errorMessages } = this.state;

		return (
			<>
				<DomainContactDetails
					domainNames={ [] }
					contactDetails={ contactDetails }
					contactDetailsErrors={ errorMessages }
					updateDomainContactFields={ this.updateDomainContactFields }
					shouldShowContactDetailsValidationErrors={ true }
					isLoggedOutCart={ false }
				/>
				{ this.renderTransferLockOptOut() }
				<div className="list__form-buttons">
					<Button primary onClick={ this.submit }>
						{ this.props.translate( 'Submit' ) }
					</Button>
				</div>
			</>
		);
	}
}

const trackBulkUpdateContactInfoSubmit = ( domainNamesList ) =>
	recordTracksEvent( 'calypso_domain_management_bulk_update_contact_info_submit', {
		domainNamesList,
	} );

export default connect(
	( state, props ) => {
		return {
			contactDetailsCache: getContactDetailsCache( state ),
			isRequestingContactDetailsCache: isRequestingContactDetailsCache( state ),
			userSettings: getUserSettings( state ),

			// isUpdatingWhois: isUpdatingWhois( state, props.selectedDomain.name ),
			// whoisSaveError: getWhoisSaveError( state, props.selectedDomain.name ),
			// whoisSaveSuccess: getWhoisSaveSuccess( state, props.selectedDomain.name ),
		};
	},
	{
		trackBulkUpdateContactInfoSubmit,
		requestContactDetailsCache,
		saveWhois,
		fetchUserSettings,
		errorNotice,
		infoNotice,
		successNotice,
	}
)( localize( BulkEditContactInfo ) );
