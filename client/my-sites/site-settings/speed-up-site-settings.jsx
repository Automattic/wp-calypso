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
import Card from 'components/card';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import SupportInfo from 'components/support-info';

class SpeedUpSiteSettings extends Component {
	static propTypes = {
		fields: PropTypes.object,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		jetpackVersionSupportsLazyImages: PropTypes.bool,

		// Connected props
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			selectedSiteId,
			photonModuleUnavailable,
			isRequestingSettings,
			isSavingSettings,
			translate,
			jetpackVersionSupportsLazyImages,
		} = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__speed-up-site-settings">
				<Card>
					<FormFieldset className="site-settings__formfieldset">
						<SupportInfo
							text={ translate( 'Hosts your image files on the global WordPress.com servers.' ) }
							link="https://jetpack.com/support/photon/"
						/>
						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="photon"
							label={ translate( 'Serve images from our servers' ) }
							description={ translate(
								'Jetpack will optimize your images and serve them from the server ' +
									'location nearest to your visitors. Using our global content delivery ' +
									'network will boost the loading speed of your site.'
							) }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
						/>
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

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'photon'
	);

	return {
		photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		selectedSiteId,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( SpeedUpSiteSettings ) );
