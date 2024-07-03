import { Card } from '@automattic/components';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import SurveyModal from 'calypso/components/survey-modal';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const Sso = ( {
	isAtomic,
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	ssoModuleActive,
	ssoModuleUnavailable,
	translate,
} ) => {
	const localeSlug = useLocale();
	const [ isModalVisible, setIsModalVisible ] = useState( false );

	return (
		<>
			<div>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<Card className="sso__card site-settings__security-settings">
					<FormFieldset>
						<SupportInfo
							text={ translate(
								'Allows registered users to log in to your site with their WordPress.com accounts.'
							) }
							link={
								isAtomic
									? localizeUrl( 'https://wordpress.com/support/wordpress-com-secure-sign-on-sso/' )
									: 'https://jetpack.com/support/sso/'
							}
							privacyLink={ ! isAtomic }
						/>

						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="sso"
							label={ translate(
								'Allow users to log in to this site using WordPress.com accounts'
							) }
							description={ translate( "Use WordPress.com's secure authentication" ) }
							disabled={ isRequestingSettings || isSavingSettings || ssoModuleUnavailable }
							onChange={ ( enabled ) => {
								if ( ! enabled ) {
									setIsModalVisible( true );
								}
							} }
						/>

						<div className="sso__module-settings site-settings__child-settings">
							<ToggleControl
								checked={ !! fields.jetpack_sso_match_by_email }
								disabled={
									isRequestingSettings ||
									isSavingSettings ||
									! ssoModuleActive ||
									ssoModuleUnavailable
								}
								onChange={ handleAutosavingToggle( 'jetpack_sso_match_by_email' ) }
								label={ translate( 'Match accounts using email addresses' ) }
							/>

							<ToggleControl
								checked={ !! fields.jetpack_sso_require_two_step }
								disabled={
									isRequestingSettings ||
									isSavingSettings ||
									! ssoModuleActive ||
									ssoModuleUnavailable
								}
								onChange={ handleAutosavingToggle( 'jetpack_sso_require_two_step' ) }
								label={ translate( 'Require two-step authentication' ) }
							/>
						</div>
					</FormFieldset>
				</Card>
			</div>
			{ localeSlug === 'en' &&
				isModalVisible &&
				ReactDOM.createPortal(
					<SurveyModal
						name="sso-disable"
						eventName="calypso_site_settings_sso_survey"
						url="https://wordpressdotcom.survey.fm/disable-sso-survey?initiated-from=calypso"
						heading={ translate( 'SSO Survey' ) }
						title={ translate( 'Hi there!' ) }
						description={ translate(
							`Spare a moment? We'd love to hear why you want to disable SSO in a quick survey.`
						) }
						dismissText={ translate( 'Remind later' ) }
						confirmText={ translate( 'Take survey' ) }
					/>,
					document.body
				) }
		</>
	);
};

Sso.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

Sso.propTypes = {
	isAtomic: PropTypes.bool,
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
