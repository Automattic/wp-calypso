/** @format */

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
import Card from 'client/components/card';
import JetpackModuleToggle from 'client/my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'client/components/forms/form-fieldset';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import {
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode,
} from 'client/state/selectors';
import InfoPopover from 'client/components/info-popover';
import ExternalLink from 'client/components/external-link';
import QueryJetpackConnection from 'client/components/data/query-jetpack-connection';

const Masterbar = ( {
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	masterbarModuleUnavailable,
	translate,
} ) => {
	return (
		<div>
			<QueryJetpackConnection siteId={ selectedSiteId } />

			<Card className="masterbar__card site-settings__security-settings">
				<FormFieldset>
					<div className="masterbar__info-link-container site-settings__info-link-container">
						<InfoPopover position="left">
							<ExternalLink href="https://jetpack.com/support/masterbar/" icon target="_blank">
								{ translate( 'Learn more about the WordPress.com Toolbar.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="masterbar"
						label={ translate( 'Enable the WordPress.com toolbar' ) }
						description={ translate(
							'The WordPress.com toolbar replaces the default admin bar and offers quick links to ' +
								'the Reader, all your sites, your WordPress.com profile, and notifications. ' +
								'Centralize your WordPress experience with a single global toolbar.'
						) }
						disabled={ isRequestingSettings || isSavingSettings || masterbarModuleUnavailable }
					/>
				</FormFieldset>
			</Card>
		</div>
	);
};

Masterbar.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
};

Masterbar.propTypes = {
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'masterbar'
	);

	return {
		selectedSiteId,
		masterbarModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Masterbar ) );
