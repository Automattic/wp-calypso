import { Card, CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import { isJetpackSite, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class SpeedUpSiteSettings extends Component {
	static propTypes = {
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		submitForm: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,

		// Connected props
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteAcceleratorStatus: PropTypes.bool,
	};

	handleCdnChange = () => {
		const { siteAcceleratorStatus, submitForm, updateFields } = this.props;

		// If one of them is on, we turn everything off.
		updateFields(
			{
				photon: ! siteAcceleratorStatus,
				'photon-cdn': ! siteAcceleratorStatus,
			},
			submitForm
		);
	};

	render() {
		const {
			isPageOptimizeActive,
			isRequestingSettings,
			isSavingSettings,
			pageOptimizeUrl,
			photonModuleUnavailable,
			selectedSiteId,
			siteAcceleratorStatus,
			siteIsJetpack,
			translate,
		} = this.props;

		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__speed-up-site-settings">
				<Card>
					<FormFieldset className="site-settings__formfieldset jetpack-site-accelerator-settings">
						<SupportInfo
							text={ translate(
								"Jetpack's global Content Delivery Network (CDN) optimizes " +
									'files and images so your visitors enjoy ' +
									'the fastest experience regardless of device or location.'
							) }
							link="http://jetpack.com/support/site-accelerator/"
						/>
						<FormSettingExplanation className="site-settings__feature-description">
							{ translate(
								'Load pages faster by allowing Jetpack to optimize your images and serve your images ' +
									'and static files (like CSS and JavaScript) from our global network of servers.'
							) }
						</FormSettingExplanation>
						<ToggleControl
							checked={ siteAcceleratorStatus }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
							onChange={ this.handleCdnChange }
							label={ translate( 'Enable site accelerator' ) }
						/>
						<div className="site-settings__child-settings">
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon"
								label={ translate( 'Speed up image load times' ) }
								disabled={ isRequestingOrSaving || photonModuleUnavailable }
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon-cdn"
								label={ translate( 'Speed up static file load times' ) }
								disabled={ isRequestingOrSaving }
							/>
						</div>
					</FormFieldset>

					{ siteIsJetpack && (
						<FormFieldset className="site-settings__formfieldset has-divider is-top-only jetpack-lazy-images-settings">
							<SupportInfo
								text={ translate(
									"Delays the loading of images until they are visible in the visitor's browser."
								) }
								link="https://jetpack.com/support/lazy-images/"
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="lazy-images"
								label={ translate( 'Lazy load images' ) }
								description={ translate(
									"Improve your site's speed by only loading images visible on the screen. New images will " +
										'load just before they scroll into view. This prevents viewers from having to download ' +
										"all the images on a page all at once, even ones they can't see."
								) }
								disabled={ isRequestingOrSaving }
							/>
						</FormFieldset>
					) }
				</Card>
				{ isPageOptimizeActive && (
					<div className="site-settings__page-optimize">
						<CompactCard href={ pageOptimizeUrl }>
							{ translate( 'Optimize JS and CSS for faster page load and render in the browser.' ) }
						</CompactCard>
					</div>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'photon'
	);
	const photonModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon' );
	const assetCdnModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon-cdn' );

	// Status of the main site accelerator toggle.
	const siteAcceleratorStatus = !! ( photonModuleActive || assetCdnModuleActive );

	return {
		photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		selectedSiteId,
		siteAcceleratorStatus,
		siteIsJetpack: isJetpackSite( state, selectedSiteId ),
		isPageOptimizeActive: isPluginActive( state, selectedSiteId, 'page-optimize' ),
		pageOptimizeUrl: getSiteAdminUrl( state, selectedSiteId, 'admin.php?page=page-optimize' ),
	};
} )( localize( SpeedUpSiteSettings ) );
