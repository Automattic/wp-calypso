import { Button } from '@automattic/components';
import {
	mapRecordKeysRecursively,
	camelToSnakeCase,
	snakeToCamelCase,
} from '@automattic/wpcom-checkout';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import wp from 'calypso/lib/wp';
import DomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/components/domain-contact-details';
import TransferLockOptOut from 'calypso/my-sites/domains/domain-management/list/transfer-lock-opt-out';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestContactDetailsCache, saveWhois } from 'calypso/state/domains/management/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import isRequestingContactDetailsCache from 'calypso/state/selectors/is-requesting-contact-details-cache';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

import './list-all.scss';

class BulkEditContactInfo extends Component {
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
		hasSetInitialContactEmail: false,
		contactDetails: {},
		errorMessages: {},
	};

	componentDidMount() {
		if ( Object.keys( this.props.userSettings ?? {} ).length === 0 ) {
			this.props.fetchUserSettings();
		}

		if ( Object.keys( this.props.contactDetailsCache ?? {} ).length === 0 ) {
			this.props.requestContactDetailsCache();
		}

		this.debouncedValidateContactDetails = this.debounce( this.validateContactDetails, 500 );
	}

	componentDidUpdate() {
		const { new_user_email, user_email } = this.props.userSettings ?? {};
		const accountEmail = new_user_email?.length > 0 ? new_user_email : user_email;

		if (
			( accountEmail ?? '' ).length > 0 &&
			( this.state.contactDetails?.email ?? '' ).length === 0 &&
			false === this.state.hasSetInitialContactEmail
		) {
			this.setInitialContactEmail( accountEmail );
		}

		if (
			Object.keys( this.props.contactDetailsCache ?? {} ).length > 0 &&
			false === this.state.hasSetContactDetailsFromCache
		) {
			const { email, ...contactDetailsCache } = this.props.contactDetailsCache;
			this.setContactDetailsFromCache( contactDetailsCache );
		}
	}

	debounce = ( func, delay, { leading } = {} ) => {
		let timerId;

		return ( ...args ) => {
			if ( ! timerId && leading ) {
				func( ...args );
			}
			clearTimeout( timerId );

			timerId = setTimeout( () => func( ...args ), delay );
		};
	};

	isLoading() {
		return (
			Object.keys( this.props.contactDetailsCache ?? {} ).length === 0 ||
			this.props.isRequestingContactDetailsCache ||
			this.props.isFetchingUserSettings
		);
	}

	setInitialContactEmail = ( email ) => {
		this.setState( { hasSetInitialContactEmail: true }, () => {
			this.updateDomainContactFields( { email } );
		} );
	};

	setContactDetailsFromCache = ( data ) => {
		this.setState( { hasSetContactDetailsFromCache: true }, () => {
			this.updateDomainContactFields( data );
		} );
	};

	updateDomainContactFields = ( data ) => {
		const newContactDetails = Object.assign( {}, this.state.contactDetails, data );
		this.setState( { contactDetails: newContactDetails } );
		Object.keys( newContactDetails ).length > 0 &&
			this.debouncedValidateContactDetails( newContactDetails );
	};

	onTransferLockOptOutChange = ( event ) => {
		this.props.onTransferLockOptOutChange( event.target.checked );
	};

	validateContactDetails = ( contactDetails ) => {
		if ( this.isLoading() ) {
			return;
		}

		wp.req
			.post( '/me/domain-contact-information/validate', {
				contactInformation: mapRecordKeysRecursively( contactDetails, camelToSnakeCase ),
				domainNames: this.props.domainNamesList ?? [],
			} )
			.then( ( data ) => {
				let errorMessages = mapRecordKeysRecursively(
					( data && data.messages ) || {},
					snakeToCamelCase
				);
				if ( Object.keys( errorMessages ).length > 0 ) {
					errorMessages = Object.entries( errorMessages ).reduce( ( result, [ field, errors ] ) => {
						result[ field ] = Array.isArray( errors ) ? errors.join( ' ' ) : errors;
						return result;
					}, {} );
				}

				this.setState( {
					errorMessages,
				} );
			} );
	};

	handleSaveContactInfo = () => this.props.handleSaveContactInfo( this.state.contactDetails );

	render() {
		const { emailOnly, isDisabled, isSubmitting, translate } = this.props;
		const { contactDetails, errorMessages } = this.state;

		const hasValidationErrors = Object.keys( errorMessages ?? {} ).length > 0;

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
						disabled={ isDisabled || hasValidationErrors }
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
