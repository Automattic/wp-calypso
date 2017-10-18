/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingLists } from 'woocommerce/state/sites/settings/email/selectors';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import QueryMailChimpLists from 'woocommerce/state/sites/settings/email/queryLists';

const NewsletterSettings = ( { storeData = {}, onChange, siteId, isRequesting, translate } ) => {
	return (
		<FormFieldset className="setup-steps__store-info-field">
			<QueryMailChimpLists siteId={ siteId } />
			<div className="setup-steps__login-title">{ translate( 'Now choose a list to sync!' ) }</div>
			<p>{ translate(
					'Choose your list carefully as you wont be able to change it later. ' +
					'Create a list in MailChimp if you have not already done so.'
				) }
			</p>
			<FormLabel>
				{ translate( 'Newsletter' ) }
			</FormLabel>
			<FormSelect
				name={ 'mailchimp_list' }
				onChange={ onChange }
				value={ storeData.mailchimp_list }
				disabled={ isRequesting }>
				{ storeData.mailchimp_lists &&
					map( storeData.mailchimp_lists, ( list, key ) => (
						<option key={ key } value={ key }>{ list }</option>
					) )
				}
			</FormSelect>
			<p className="setup-steps__sync-explanation">
				{ translate(
					'We will then sync your orders so you can segment based on purchase ' +
						'history and products so you automatically add product information into customer emails.'
				) }
			</p>
		</FormFieldset>
	);
};

NewsletterSettings.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	isRequesting: PropTypes.bool,
};

const NewsletterSettingsConnected = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			isRequesting: isRequestingLists( state, siteId ),
		};
	}
)( NewsletterSettings );

export default localize( NewsletterSettingsConnected );
