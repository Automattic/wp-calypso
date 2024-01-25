import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function Widgets( { isSavingSettings, isRequestingSettings, isAtomic, translate } ) {
	const isFormPending = isRequestingSettings || isSavingSettings;
	const selectedSiteId = useSelector( getSelectedSiteId );

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Widgets' ) } />

			<Card className="site-settings">
				<FormFieldset>
					<SupportInfo
						text={ translate( 'Provides additional widgets for use on your site.' ) }
						link="https://jetpack.com/support/extra-sidebar-widgets/"
					/>

					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="widgets"
						label={ translate(
							'Make extra widgets available for use on your site including images and Twitter streams'
						) }
						disabled={ isFormPending }
					/>
				</FormFieldset>
				<hr />

				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Widget visibility lets you decide which widgets appear on which pages, so you can finely tailor widget content.'
						) }
						link={
							isAtomic
								? localizeUrl( 'https://wordpress.com/support/widgets/#widget-visibility' )
								: 'https://jetpack.com/support/widget-visibility'
						}
						privacyLink={ ! isAtomic }
					/>
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="widget-visibility"
						label={ translate(
							'Enable widget visibility controls to display widgets only on particular posts or pages'
						) }
						disabled={ isFormPending }
					/>
				</FormFieldset>
			</Card>
		</>
	);
}

Widgets.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
};

Widgets.propTypes = {
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
};

export default Widgets;
