/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import DomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/components/domain-contact-details';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import isRequestingContactDetailsCache from 'calypso/state/selectors/is-requesting-contact-details-cache';
import { requestContactDetailsCache, saveWhois } from 'calypso/state/domains/management/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import TransferLockOptOut from 'calypso/my-sites/domains/domain-management/list/transfer-lock-opt-out';
import { debounce, isEmpty } from './utils';
import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

/**
 * Style dependencies
 */
import './list-all.scss';

class BulkEditContactInfo extends React.Component {
	static propTypes = {
		handleSaveContactInfo: PropTypes.func.isRequired,
		isDisabled: PropTypes.bool,
		isSubmitting: PropTypes.bool,
		onTransferLockOptOutChange: PropTypes.func.isRequired,
		emailOnly: PropTypes.bool,
		domainNamesList: PropTypes.array,
	};

	static defaultProps = {
		isDisabled: false,
		isSubmitting: false,
		emailOnly: false,
	};

	state = {
		hasSetContactDetailsFromCache: false,
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
		const { new_user_email, user_email } = this.props.userSettings ?? {};
		const email = new_user_email?.length > 0 ? new_user_email : user_email;

		if ( ! isEmpty( email ) && isEmpty( this.state.contactDetails?.email ) ) {
			this.updateDomainContactFields( { email: email } );
		}

		if (
			! isEmpty( this.props.contactDetailsCache ) &&
			false === this.state.hasSetContactDetailsFromCache
		) {
			const contactDetailsCopy = JSON.parse( JSON.stringify( this.props.contactDetailsCache ) );
			this.setContactDetailsFromCache( contactDetailsCopy );
		}
	}

	isLoading() {
		return (
			isEmpty( this.props.contactDetailsCache ) ||
			this.props.isRequestingContactDetailsCache ||
			this.props.isFetchingUserSettings
		);
	}

	setContactDetailsFromCache = ( data ) => {
		delete data.email;
		this.setState( { hasSetContactDetailsFromCache: true }, () => {
			this.updateDomainContactFields( data );
		} );
	};

	updateDomainContactFields = ( data ) => {
		const newContactDetails = Object.assign( {}, this.state.contactDetails, data );
		this.setState( { contactDetails: newContactDetails } );
		! isEmpty( newContactDetails ) && this.debouncedValidateContactDetails( newContactDetails );
	};

	onTransferLockOptOutChange = ( event ) => {
		this.props.onTransferLockOptOutChange( event.target.checked );
	};

	validateContactDetails = ( contactDetails ) => {
		if ( this.isLoading() ) {
			return;
		}

		wpcom.validateDomainContactInformation(
			contactDetails,
			this.props.domainNamesList,
			( error, data ) => {
				let errorMessages = ( data && data.messages ) || {};
				if ( ! isEmpty( errorMessages ) ) {
					errorMessages = Object.entries( errorMessages ).reduce( ( result, [ field, errors ] ) => {
						result[ field ] = Array.isArray( errors ) ? errors.join( ' ' ) : errors;
						return result;
					}, {} );
				}

				this.setState( {
					errorMessages,
				} );
			}
		);
	};

	handleSaveContactInfo = () => this.props.handleSaveContactInfo( this.state.contactDetails );

	render() {
		const { emailOnly, isDisabled, isSubmitting, translate } = this.props;
		const { contactDetails, errorMessages } = this.state;

		return (
			<>
				<DomainContactDetails
					domainNames={ [] }
					contactDetails={ contactDetails }
					contactDetailsErrors={ errorMessages }
					updateDomainContactFields={ this.updateDomainContactFields }
					shouldShowContactDetailsValidationErrors={ ! this.isLoading() }
					isLoggedOutCart={ false }
					isDisabled={ isDisabled || isSubmitting }
					emailOnly={ emailOnly }
				/>
				<TransferLockOptOut
					disabled={ isDisabled || isSubmitting }
					onChange={ this.onTransferLockOptOutChange }
					saveButtonLabel={ translate( 'Save contact info' ) }
				/>
				<div className="list__form-buttons">
					<Button
						primary
						onClick={ this.handleSaveContactInfo }
						disabled={ isDisabled }
						busy={ isSubmitting }
					>
						{ this.props.translate( 'Save contact info' ) }
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
	( state ) => {
		return {
			contactDetailsCache: getContactDetailsCache( state ),
			isFetchingUserSettings: isFetchingUserSettings( state ),
			isRequestingContactDetailsCache: isRequestingContactDetailsCache( state ),
			userSettings: getUserSettings( state ),
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
