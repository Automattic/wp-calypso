/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode
} from 'state/selectors';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

const Subscriptions = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	moduleUnavailable,
	selectedSiteId,
	selectedSiteSlug,
	subscriptionsModuleActive,
	translate
} ) => {
	return (
		<div>
			<QueryJetpackConnection siteId={ selectedSiteId } />

			<CompactCard className="subscriptions__card site-settings__discussion-settings">
				<FormFieldset>
					<div className="subscriptions__info-link-container site-settings__info-link-container">
						<InfoPopover position={ 'left' }>
							<ExternalLink href={ 'https://jetpack.com/support/subscriptions' } icon target="_blank">
								{ translate( 'Learn more about Subscriptions.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="subscriptions"
						label={ translate( 'Allow users to subscribe to your posts and comments and receive notifications via email' ) }
						disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable }
						/>

					<div className="subscriptions__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.stb_enabled }
							disabled={ isRequestingSettings || isSavingSettings || ! subscriptionsModuleActive || moduleUnavailable }
							onChange={ handleAutosavingToggle( 'stb_enabled' ) }
						>
							{ translate( 'Show a "follow blog" option in the comment form' ) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.stc_enabled }
							disabled={ isRequestingSettings || isSavingSettings || ! subscriptionsModuleActive || moduleUnavailable }
							onChange={ handleAutosavingToggle( 'stc_enabled' ) }
						>
							{ translate( 'Show a "follow comments" option in the comment form' ) }
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
	fields: {}
};

Subscriptions.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleAutosavingToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, selectedSiteId, 'subscriptions' );

		return {
			selectedSiteId,
			selectedSiteSlug,
			subscriptionsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'subscriptions' ),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	}
)( localize( Subscriptions ) );
