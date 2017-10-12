/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingLists } from 'woocommerce/state/sites/settings/email/selectors';
import { localize } from 'i18n-calypso';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import QueryMailChimpLists from 'woocommerce/state/sites/settings/email/queryLists';

const NewsletterSettings = ( { storeData, onChange, siteId, isRequesting, translate } ) => {
	return (
		<FormFieldset className="setup-steps__store-info-field">
			<QueryMailChimpLists siteId={ siteId } />
			<div>Pick a list, you will not able to change it for now so pick carfully</div>
			<div>Create you list at mailchimp.com if you have not done it aready</div>
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
		</FormFieldset>
	);
};

NewsletterSettings.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object,
	siteId: PropTypes.number.isRequired,
	isRequesting: PropTypes.bool
};

const NewsletterSettingsConnected = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			isRequesting: isRequestingLists( state, siteId )
		};
	}
)( NewsletterSettings );

export default localize( NewsletterSettingsConnected );
