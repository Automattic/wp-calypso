/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActionPanel from 'my-sites/site-settings/action-panel';
import ActionPanelTitle from 'my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'my-sites/site-settings/action-panel/body';
import ActionPanelFooter from 'my-sites/site-settings/action-panel/footer';
import Button from 'components/button';
import support from 'lib/url/support';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteDomain } from 'state/sites/selectors';
import userSettings from 'lib/user-settings';

const TransferSiteToUserWarning = ( { translate, selectedSiteDomain, currentUserEmail } ) => {
	const transOpts = {
		args: {
			domain: selectedSiteDomain,
			email: currentUserEmail,
		},
	};

	return (
		<ActionPanel>
			<ActionPanelBody>
				<ActionPanelTitle>{ translate( 'Transfer Your Site' ) }</ActionPanelTitle>
				<p>
					{ translate(
						'Transferring a site cannot be undone. ' +
							'Please read the following actions that will ' +
							'take place when you transfer this blog:'
					) }
				</p>
				<ul>
					<li>{ translate( 'You will be removed as owner of ' + '%(domain)s', transOpts ) }</li>
					<li>
						{ translate(
							'You will not be able to access ' + '%(domain)s unless allowed by the new owner',
							transOpts
						) }
					</li>
					<li>
						{ translate(
							'Your posts on %(domain)s ' +
								'will be transferred to the new owner and ' +
								'will no longer be authored by your account.',
							transOpts
						) }
					</li>
				</ul>
				<p>
					{ translate(
						'Note that you will be sent a ' +
							'confirmation email to %(email)s before ' +
							'the above actions are performed.',
						transOpts
					) }
				</p>
				<p>
					{ translate( 'Please make sure this is what you want ' + 'to do before continuing!' ) }
				</p>
			</ActionPanelBody>
			<ActionPanelFooter>
				<Button href={ support.EMPTY_SITE } className="transfer-site-to-user__continue is-scary">
					{ translate( 'Continue' ) }
					<Gridicon icon="chevron-right" size={ 48 } />
				</Button>
			</ActionPanelFooter>
		</ActionPanel>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		selectedSiteDomain: getSiteDomain( state, siteId ),
		currentUserEmail: userSettings.getSetting( 'user_email' ),
	};
} )( localize( TransferSiteToUserWarning ) );
