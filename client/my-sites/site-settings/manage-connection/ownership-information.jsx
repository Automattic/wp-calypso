/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection-connected';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';

const OwnershipInformation = ( { isChatActive, isChatAvailable, translate } ) => (
	<FormFieldset className="manage-connection__formfieldset has-divider is-top-only">
		<div className="manage-connection__ownership-info">
			<Gridicon
				icon="info-outline"
				size={ 24 }
				className="manage-connection__ownership-info-icon"
			/>

			<div className="manage-connection__ownership-info-text">
				<FormSettingExplanation>
					{ translate(
						'{{strong}}Site owners{{/strong}} are users who have connected Jetpack to WordPress.com.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
					<br />
					{ translate(
						'{{strong}}Plan purchasers{{/strong}} are users who purchased a paid plan for the site.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</FormSettingExplanation>
				<FormSettingExplanation>
					{ translate(
						'Usually these are the same person, but sometimes they can differ. E.g., developers may be ' +
							'a Site owner, because they set up the website and connected Jetpack to WordPress.com and ' +
							'their clients may be Plan purchasers who use their billing information to purchase the plan ' +
							'for the site.'
					) }
				</FormSettingExplanation>

				<HappychatConnection />
				{ ( isChatActive || isChatAvailable ) && (
					<FormSettingExplanation>
						<HappychatButton>{ translate( 'Need help? Chat with us' ) }</HappychatButton>
					</FormSettingExplanation>
				) }
			</div>
		</div>
	</FormFieldset>
);

export default connect( ( state ) => ( {
	isChatAvailable: isHappychatAvailable( state ),
	isChatActive: hasActiveHappychatSession( state ),
} ) )( localize( OwnershipInformation ) );
