/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import SupportInfo from 'components/support-info';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class MediaSettingsWriting extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		jetpackVersionSupportsLazyImages: PropTypes.bool,

		// Connected props
		carouselActive: PropTypes.bool.isRequired,
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			carouselActive,
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			jetpackVersionSupportsLazyImages,
			onChangeField,
			photonModuleUnavailable,
			selectedSiteId,
			siteId,
			translate,
		} = this.props;
		const labelClassName = isSavingSettings || ! carouselActive ? 'is-disabled' : null;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;
		const carouselFieldsetClasses = classNames( 'site-settings__formfieldset', {
			'has-divider': ! jetpackVersionSupportsLazyImages,
			'is-top-only': ! jetpackVersionSupportsLazyImages,
		} );

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<Card>
					<QueryJetpackConnection siteId={ selectedSiteId } />
					{ /**
					 * In Jetpack 5.8-alpha, we introduced Lazy Images, created a new "Speed up your site" section,
					 * and moved the photon setting there. To minimize confusion, if this Jetpack site doesn't have 5.8-alpha,
					 * let's show the Photon setting here instead of in the "Speed up your site" section.
					 */ }
					{ ! jetpackVersionSupportsLazyImages && (
						<FormFieldset>
							<SupportInfo
								text={ translate( 'Hosts your image files on the global WordPress.com servers.' ) }
								link="https://jetpack.com/support/photon/"
							/>
							<JetpackModuleToggle
								siteId={ siteId }
								moduleSlug="photon"
								label={ translate( 'Speed up images and photos' ) }
								description={ translate( 'Must be enabled to use tiled galleries.' ) }
								disabled={ isRequestingOrSaving || photonModuleUnavailable }
							/>
						</FormFieldset>
					) }
					<FormFieldset className={ carouselFieldsetClasses }>
						<SupportInfo
							text={ translate( 'Gorgeous full-screen photo browsing experience.' ) }
							link="https://jetpack.com/support/carousel/"
						/>
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="carousel"
							label={ translate(
								'Transform standard image galleries into full-screen slideshows'
							) }
							disabled={ isRequestingOrSaving }
						/>
						<div className="site-settings__child-settings">
							<CompactFormToggle
								checked={ fields.carousel_display_exif || false }
								disabled={ isRequestingOrSaving || ! carouselActive }
								onChange={ handleAutosavingToggle( 'carousel_display_exif' ) }
							>
								{ translate( 'Show photo metadata in carousel, when available' ) }
							</CompactFormToggle>
							<FormLabel className={ labelClassName } htmlFor="carousel_background_color">
								{ translate( 'Background color' ) }
							</FormLabel>
							<FormSelect
								name="carousel_background_color"
								id="carousel_background_color"
								value={ fields.carousel_background_color || 'black' }
								onChange={ onChangeField( 'carousel_background_color' ) }
								disabled={ isRequestingOrSaving || ! carouselActive }
							>
								<option value="black" key="carousel_background_color_black">
									{ translate( 'Black' ) }
								</option>
								<option value="white" key="carousel_background_color_white">
									{ translate( 'White' ) }
								</option>
							</FormSelect>
						</div>
					</FormFieldset>
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
		carouselActive: !! isJetpackModuleActive( state, selectedSiteId, 'carousel' ),
		photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		selectedSiteId,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( MediaSettingsWriting ) );
