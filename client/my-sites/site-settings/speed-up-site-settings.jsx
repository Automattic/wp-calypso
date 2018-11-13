/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { activateModule, deactivateModule } from 'state/jetpack/modules/actions';
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackMinimumVersion } from 'state/sites/selectors';
import isActivatingJetpackModule from 'state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'state/selectors/is-deactivating-jetpack-module';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SupportInfo from 'components/support-info';

class SpeedUpSiteSettings extends Component {
	static defaultProps = {
		togglingSiteAccelerator: false,
	};

	static propTypes = {
		activateModule: PropTypes.func,
		deactivateModule: PropTypes.func,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		jetpackVersionSupportsLazyImages: PropTypes.bool,
		submitForm: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,

		// Connected props
		assetCdnModuleActive: PropTypes.bool,
		photonModuleActive: PropTypes.bool,
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteAcceleratorStatus: PropTypes.bool,
		siteAcceleratorSupported: PropTypes.bool,
		siteSlug: PropTypes.string,
		togglingSiteAccelerator: PropTypes.bool,
	};

	handleCdnChange = () => {
		const { siteAcceleratorStatus, submitForm, updateFields } = this.props;

		// If one of them is on, we turn everything off.
		updateFields(
			{
				photon: ! siteAcceleratorStatus,
				'photon-cdn': ! siteAcceleratorStatus,
			},
			() => {
				submitForm();
			}
		);
	};

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			jetpackVersionSupportsLazyImages,
			photonModuleUnavailable,
			selectedSiteId,
			siteAcceleratorSupported,
			siteAcceleratorStatus,
			translate,
			togglingSiteAccelerator,
		} = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__speed-up-site-settings">
				<Card>
					<FormFieldset className="site-settings__formfieldset">
						<SupportInfo
							text={ translate(
								"Jetpack's global Content Delivery Network (CDN) optimizes " +
									'files and images so your visitors enjoy ' +
									'the fastest experience regardless of device or location.'
							) }
							link="http://jetpack.com/support/site-accelerator/"
						/>
						<p className="site-settings__feature-description form-setting-explanation">
							{ translate(
								'Load pages faster by allowing Jetpack to optimize your images and serve your images ' +
									'and static files (like CSS and JavaScript) from our global network of servers.'
							) }
						</p>
						<CompactFormToggle
							checked={ siteAcceleratorStatus }
							disabled={
								isRequestingOrSaving ||
								photonModuleUnavailable ||
								! siteAcceleratorSupported ||
								togglingSiteAccelerator
							}
							onChange={ this.handleCdnChange }
							toggling={ togglingSiteAccelerator }
						>
							{ translate( 'Enable site accelerator' ) }
						</CompactFormToggle>
						<div className="site-settings__child-settings">
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon"
								label={ translate( 'Speed up image load times' ) }
								disabled={
									isRequestingOrSaving || photonModuleUnavailable || togglingSiteAccelerator
								}
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon-cdn"
								label={ translate( 'Speed up static file load times' ) }
								disabled={
									isRequestingOrSaving || ! siteAcceleratorSupported || togglingSiteAccelerator
								}
							/>
						</div>
					</FormFieldset>

					{ jetpackVersionSupportsLazyImages && (
						<FormFieldset className="site-settings__formfieldset has-divider is-top-only">
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
			</div>
		);
	}
}

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const siteAcceleratorSupported = isJetpackMinimumVersion( state, selectedSiteId, '6.6-alpha' );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'photon'
		);
		const photonModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon' );
		const assetCdnModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon-cdn' );
		const isPhotonActivating = isActivatingJetpackModule( state, selectedSiteId, 'photon' );
		const isAssetCdnActivating = isActivatingJetpackModule( state, selectedSiteId, 'photon-cdn' );
		const isPhotonDeactivating = isDeactivatingJetpackModule( state, selectedSiteId, 'photon' );
		const isAssetCdnDeactivating = isDeactivatingJetpackModule(
			state,
			selectedSiteId,
			'photon-cdn'
		);

		let togglingSiteAccelerator;
		// First Photon activating.
		if ( isPhotonActivating ) {
			if ( assetCdnModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Asset CDN activating.
		} else if ( isAssetCdnActivating ) {
			if ( photonModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Photon deactivating.
		} else if ( isPhotonDeactivating ) {
			if ( assetCdnModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Asset CDN deactivating.
		} else if ( isAssetCdnDeactivating ) {
			if ( photonModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
		} else {
			togglingSiteAccelerator = false;
		}

		// Status of the main site accelerator toggle.
		const siteAcceleratorStatus = photonModuleActive || assetCdnModuleActive ? true : false;

		return {
			assetCdnModuleActive,
			photonModuleActive,
			photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			selectedSiteId,
			siteAcceleratorStatus,
			siteAcceleratorSupported,
			siteSlug: getSiteSlug( state, selectedSiteId ),
			togglingSiteAccelerator,
		};
	},
	{
		activateModule,
		deactivateModule,
	}
)( localize( SpeedUpSiteSettings ) );
