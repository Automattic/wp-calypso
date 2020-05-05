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
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SupportInfo from 'components/support-info';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';

const Sso = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	ssoModuleActive,
	ssoModuleUnavailable,
	translate,
} ) => {
	return (
		<div>
			<QueryJetpackConnection siteId={ selectedSiteId } />

			<Card className="sso__card site-settings__security-settings">
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Allows registered users to log in to your site with their WordPress.com accounts.'
						) }
						link="https://jetpack.com/support/sso/"
					/>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="sso"
						label={ translate( 'Allow users to log in to this site using WordPress.com accounts' ) }
						description="Use WordPress.com's secure authentication"
						disabled={ isRequestingSettings || isSavingSettings || ssoModuleUnavailable }
					/>

					<div className="sso__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.jetpack_sso_match_by_email }
							disabled={
								isRequestingSettings ||
								isSavingSettings ||
								! ssoModuleActive ||
								ssoModuleUnavailable
							}
							onChange={ handleAutosavingToggle( 'jetpack_sso_match_by_email' ) }
						>
							{ translate( 'Match accounts using email addresses' ) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.jetpack_sso_require_two_step }
							disabled={
								isRequestingSettings ||
								isSavingSettings ||
								! ssoModuleActive ||
								ssoModuleUnavailable
							}
							onChange={ handleAutosavingToggle( 'jetpack_sso_require_two_step' ) }
						>
							{ translate( 'Require two-step authentication' ) }
						</CompactFormToggle>
					</div>
				</FormFieldset>
			</Card>
		</div>
	);
};

Sso.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

Sso.propTypes = {
	handleAutosavingToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'sso'
	);

	return {
		selectedSiteId,
		ssoModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'sso' ),
		ssoModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Sso ) );
