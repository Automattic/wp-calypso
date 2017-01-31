/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

const Subscriptions = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	selectedSiteSlug,
	subscriptionsModuleActive,
	translate
} ) => {
	return (
		<Card className="subscriptions__card site-settings">
			<FormFieldset>
				<div className="subscriptions__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/subscriptions' } target="_blank">
							{ translate( 'Learn more about Subscriptions' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="subscriptions"
					label={ translate( 'Allow users to subscribe to your posts and comments and receive notifications via email.' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					/>

				<div className="subscriptions__module-settings is-indented">
					<FormToggle
						className="subscriptions__module-settings-toggle is-compact"
						checked={ !! fields.stb_enabled }
						disabled={ isRequestingSettings || isSavingSettings || ! subscriptionsModuleActive }
						onChange={ handleToggle( 'stb_enabled' ) }>
						<span className="site-settings__toggle-label">
							{ translate( 'Show a "follow blog" option in the comment form' ) }
						</span>
					</FormToggle>

					<FormToggle
						className="subscriptions__module-settings-toggle is-compact"
						checked={ !! fields.stc_enabled }
						disabled={ isRequestingSettings || isSavingSettings || ! subscriptionsModuleActive }
						onChange={ handleToggle( 'stc_enabled' ) }>
						<span className="site-settings__toggle-label">
							{ translate( 'Show a "follow comments" option in the comment form.' ) }
						</span>
					</FormToggle>

					<p className="subscriptions__email-followers">
						<a href={ '/people/email-followers/' + selectedSiteSlug }>
							{ translate( 'View your Email Followers' ) }
						</a>
					</p>
				</div>
			</FormFieldset>
		</Card>
	);
};

Subscriptions.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

Subscriptions.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSiteSlug = getSelectedSiteSlug( state );

		return {
			selectedSiteId,
			selectedSiteSlug,
			subscriptionsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'subscriptions' ),
		};
	}
)( localize( Subscriptions ) );
