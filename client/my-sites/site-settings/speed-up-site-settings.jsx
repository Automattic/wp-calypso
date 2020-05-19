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
import { Card } from '@automattic/components';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SupportInfo from 'components/support-info';

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
			isRequestingSettings,
			isSavingSettings,
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
						<CompactFormToggle
							checked={ siteAcceleratorStatus }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
							onChange={ this.handleCdnChange }
						>
							{ translate( 'Enable site accelerator' ) }
						</CompactFormToggle>
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
	};
} )( localize( SpeedUpSiteSettings ) );
