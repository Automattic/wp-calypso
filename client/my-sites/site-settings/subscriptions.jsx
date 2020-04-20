/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import SupportInfo from 'components/support-info';

const Subscriptions = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	moduleUnavailable,
	selectedSiteId,
	selectedSiteSlug,
	subscriptionsModuleActive,
	translate,
} ) => {
	return (
		<div>
			<QueryJetpackConnection siteId={ selectedSiteId } />

			<CompactCard className="subscriptions__card site-settings__discussion-settings">
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Allows readers to subscribe to your posts or comments, ' +
								'and receive notifications of new content by email.'
						) }
						link="https://jetpack.com/support/subscriptions/"
					/>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="subscriptions"
						label={ translate( 'Let visitors subscribe to new posts and comments via email' ) }
						disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable }
					/>

					<div className="subscriptions__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.stb_enabled }
							disabled={
								isRequestingSettings ||
								isSavingSettings ||
								! subscriptionsModuleActive ||
								moduleUnavailable
							}
							onChange={ handleAutosavingToggle( 'stb_enabled' ) }
						>
							{ translate( 'Enable the "subscribe to site" option on your comment form' ) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.stc_enabled }
							disabled={
								isRequestingSettings ||
								isSavingSettings ||
								! subscriptionsModuleActive ||
								moduleUnavailable
							}
							onChange={ handleAutosavingToggle( 'stc_enabled' ) }
						>
							{ translate( 'Enable the "subscribe to comments" option on your comment form' ) }
						</CompactFormToggle>
					</div>
				</FormFieldset>
			</CompactCard>

			<CompactCard href={ '/people/email-followers/' + selectedSiteSlug }>
				{ translate( 'View your email followers' ) }
			</CompactCard>

			<CompactCard href={ 'https://wordpress.com/manage/' + selectedSiteId }>
				{ translate( 'Migrate followers from another site' ) }
			</CompactCard>
		</div>
	);
};

Subscriptions.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

Subscriptions.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleAutosavingToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSiteSlug = getSelectedSiteSlug( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'subscriptions'
	);

	return {
		selectedSiteId,
		selectedSiteSlug,
		subscriptionsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'subscriptions' ),
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Subscriptions ) );
