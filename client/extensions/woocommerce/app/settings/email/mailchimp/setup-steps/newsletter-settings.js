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
import { isRequestingLists } from 'woocommerce/state/sites/settings/mailchimp/selectors';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Notice from 'components/notice';
import QueryMailChimpLists from 'woocommerce/state/sites/settings/mailchimp/queryLists';

const NewsletterSettings = ( { storeData = {}, onChange, siteId, isRequesting, translate } ) => {
	return (
		<FormFieldset className="setup-steps__store-info-field">
			<QueryMailChimpLists siteId={ siteId } />
			<p>{ translate( 'Finally, choose a mailing list to sync with your store.' ) }</p>
			<Notice>
				<p>
					{ translate(
						"Choose your list carefully as you won't be able to change it later. " +
							'Create a list in MailChimp if you have not already done so.'
					) }
				</p>
			</Notice>
			<FormLabel>{ translate( 'Mailing list' ) }</FormLabel>
			<FormSelect
				name={ 'mailchimp_list' }
				onChange={ onChange }
				value={ storeData.mailchimp_list }
				disabled={ isRequesting }
			>
				{ storeData.mailchimp_lists &&
					map( storeData.mailchimp_lists, ( list, key ) => (
						<option key={ key } value={ key }>
							{ list }
						</option>
					) ) }
			</FormSelect>
			<FormSettingExplanation className="setup-steps__sync-explanation">
				{ translate(
					"We'll sync your orders with this list so you can segment based on purchase history. We'll also " +
						'sync products so you can add relevant product information to customer emails.'
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};

NewsletterSettings.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	isRequesting: PropTypes.bool,
};

const NewsletterSettingsConnected = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		isRequesting: isRequestingLists( state, siteId ),
	};
} )( NewsletterSettings );

export default localize( NewsletterSettingsConnected );
