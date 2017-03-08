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
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

const Sso = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	ssoModuleActive,
	translate
} ) => {
	return (
		<div>
			<Card className="sso__card site-settings__security-settings">
				<FormFieldset>
					<div className="sso__info-link-container site-settings__info-link-container">
						<InfoPopover position={ 'left' }>
							<ExternalLink href={ 'https://jetpack.com/support/sso' } target="_blank">
								{ translate( 'Learn more about WordPress.com Secure Sign On' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="sso"
						label={ translate( 'Allow log-in using WordPress.com accounts.' ) }
						description="Use WordPress.com's secure authentication"
						disabled={ isRequestingSettings || isSavingSettings }
					/>

					<div className="sso__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.jetpack_sso_match_by_email }
							disabled={ isRequestingSettings || isSavingSettings || ! ssoModuleActive }
							onChange={ handleToggle( 'jetpack_sso_match_by_email' ) }
						>
							{ translate( 'Match accounts using email addresses' ) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.jetpack_sso_require_two_step }
							disabled={ isRequestingSettings || isSavingSettings || ! ssoModuleActive }
							onChange={ handleToggle( 'jetpack_sso_require_two_step' ) }
						>
							{ translate( 'Require two step authentication' ) }
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
	fields: {}
};

Sso.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			ssoModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'sso' ),
		};
	}
)( localize( Sso ) );
