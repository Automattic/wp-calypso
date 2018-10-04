/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { requestSettingsUpdate } from 'state/mailchimp/settings/actions';
import QueryMailchimpLists from 'components/data/query-mailchimp-lists';
import QueryMailchimpSettings from 'components/data/query-mailchimp-settings';
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import { getSelectedSiteId } from 'state/ui/selectors';

const MailchimpSettings = ( {
	siteId,
	keyringConnections,
	requestSettingsUpdateAction,
	mailchimpLists,
	mailchimpListId,
} ) => {
	const chooseMailchimpList = listId => {
		requestSettingsUpdateAction( siteId, {
			follower_list_id: listId,
			keyring_id: keyringConnections[ 0 ].ID,
		} );
	};

	return (
		<div>
			<QueryMailchimpLists siteId={ siteId } />
			<QueryMailchimpSettings siteId={ siteId } />
			<FormFieldset>
				{ mailchimpLists.map( list => (
					<FormLabel key={ list.id }>
						<FormRadio
							value={ list.id }
							checked={ list.id === mailchimpListId }
							onChange={ () => chooseMailchimpList( list.id ) }
						/>
						<span>{ list.name }</span>
					</FormLabel>
				) ) }
			</FormFieldset>
		</div>
	);
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId: siteId,
			mailchimpLists: get( state, [ 'mailchimp', 'lists', 'items', siteId ], [] ),
			mailchimpListId: get(
				state,
				[ 'mailchimp', 'settings', 'items', siteId, 'follower_list_id' ],
				0
			),
		};
	},
	{
		requestSettingsUpdateAction: requestSettingsUpdate,
	}
)( localize( MailchimpSettings ) );
