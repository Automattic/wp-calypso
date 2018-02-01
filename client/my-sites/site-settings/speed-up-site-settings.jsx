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
import ExternalLink from 'components/external-link';
import {
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode,
} from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateSettings } from 'state/jetpack/settings/actions';
import { getSiteSlug, isJetpackMinimumVersion } from 'state/sites/selectors';
import InfoPopover from 'components/info-popover';

class SpeedUpSiteSettings extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		// Connected props
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
		jetpackVersionSupportsLazyImages: PropTypes.bool,
	};

	render() {
		const {
			siteId,
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
						<div className="site-settings__info-link-container">
							<InfoPopover position="left">
								<ExternalLink target="_blank" icon href="https://jetpack.com/support/photon">
									{ translate( 'Learn more' ) }
								</ExternalLink>
							</InfoPopover>
						</div>
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="photon"
							label={ translate( 'Serve images from our servers' ) }
							description={ translate(
								'Jetpack will optimize your images and server them from the server ' +
									'location nearest to your visitors. Using our global content delivery ' +
									'network will boost the loading speed of your site.'
							) }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
						/>
					</FormFieldset>

					{ jetpackVersionSupportsLazyImages && (
						<FormFieldset className="site-settings__formfieldset has-divider is-top-only">
							<div className="site-settings__info-link-container">
								<InfoPopover position="left">
									<ExternalLink target="_blank" icon href="https://jetpack.com/support/lazy-images">
										{ translate( 'Learn more' ) }
									</ExternalLink>
								</InfoPopover>
							</div>
							<JetpackModuleToggle
								siteId={ siteId }
								moduleSlug="lazy-images"
								label={ translate( '"Lazy-load" images' ) }
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
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'photon'
		);

		return {
			photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			selectedSiteId,
			siteSlug: getSiteSlug( state, selectedSiteId ),
			jetpackVersionSupportsLazyImages: isJetpackMinimumVersion(
				state,
				selectedSiteId,
				'5.8-alpha'
			),
		};
	},
	{
		updateSettings,
	}
)( localize( SpeedUpSiteSettings ) );
