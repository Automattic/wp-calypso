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
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SupportInfo from 'components/support-info';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';

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
					<SupportInfo
						text={ translate(
							'Adds a toolbar with links to all your sites, notifications, ' +
								'your WordPress.com profile, and the Reader.'
						) }
						link="https://jetpack.com/support/masterbar/"
					/>
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="masterbar"
						label={ translate( 'Enable the WordPress.com toolbar' ) }
						description={ translate(
							'The WordPress.com toolbar replaces the default WordPress admin toolbar. ' +
								'It offers one-click access to notifications, your WordPress.com profile and ' +
								'your other Jetpack and WordPress.com websites. You can also catch up on the sites ' +
								'you follow in the Reader.'
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

export default connect( ( state ) => {
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
