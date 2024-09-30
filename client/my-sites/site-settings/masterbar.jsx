import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const Masterbar = ( { isRequestingSettings = false, isSavingSettings = false } ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const masterbarModuleUnavailable = useSelector( ( state ) => {
		return (
			isJetpackSiteInDevelopmentMode( state, selectedSiteId ) &&
			isJetpackModuleUnavailableInDevelopmentMode( state, selectedSiteId, 'masterbar' )
		);
	} );

	return (
		<div>
			<QueryJetpackConnection siteId={ selectedSiteId } />
			<SettingsSectionHeader title={ translate( 'WordPress.com toolbar' ) } />
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

Masterbar.propTypes = {
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
};

export default Masterbar;
