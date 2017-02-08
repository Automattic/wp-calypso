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
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { isJetpackModuleActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateSettings } from 'state/jetpack/settings/actions';

const MediaSettings = ( {
	fields,
	handleToggle,
	onChangeField,
	isRequestingSettings,
	isSavingSettings,
	siteId,
	carouselActive,
	translate
} ) => {
	const labelClassName = isSavingSettings || ! carouselActive ? 'is-disabled' : null;

	return (
		<Card className="media-settings site-settings">
			<FormFieldset>
				<div className="media-settings__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink target="_blank" icon={ true } href={ 'https://jetpack.com/support/photon' } >
							{ translate( 'Learn more about Photon' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="photon"
					label={ translate( 'Speed up your images and photos with Photon.' ) }
					description="Enabling Photon is required to use Tiled Galleries."
					disabled={ isRequestingSettings || isSavingSettings }
					/>
			</FormFieldset>
			<FormFieldset className="media-settings__formfieldset has-divider is-top-only">
				<div className="media-settings__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink target="_blank" icon={ true } href={ 'https://jetpack.com/support/carousel' } >
							{ translate( 'Learn more about Carousel' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="carousel"
					label={ translate( 'Transform standard image galleries into full-screen slideshows.' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					/>
				<div className="media-settings__module-settings is-indented">
					<FormToggle
						className="media-settings__carousel-module-settings-toggle is-compact"
						checked={ fields.carousel_display_exif || false }
						disabled={ isRequestingSettings || isSavingSettings || ! carouselActive }
						onChange={ handleToggle( 'carousel_display_exif' ) } >
						{ translate( 'Show photo metadata in carousel, when available.' ) }
					</FormToggle>
					<FormLabel className={ labelClassName } htmlFor="carousel_background_color">
						{ translate( 'Background color' ) }
					</FormLabel>
					<FormSelect
						name="carousel_background_color"
						id="carousel_background_color"
						value={ fields.carousel_background_color || '' }
						onChange={ onChangeField( 'carousel_background_color' ) }
						disabled={ isRequestingSettings || isSavingSettings || ! carouselActive } >
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
	);
};

MediaSettings.propTypes = {
	carouselActive: PropTypes.bool.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	siteId: PropTypes.number.isRequired,
	handleToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	fields: PropTypes.object
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			carouselActive: !! isJetpackModuleActive( state, selectedSiteId, 'carousel' )
		};
	},
	{
		updateSettings
	}
)( localize( MediaSettings ) );
