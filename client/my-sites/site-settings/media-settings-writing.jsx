import { Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MediaSettingsWriting extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		handleSubmitForm: PropTypes.func.isRequired,

		// Connected props
		carouselActive: PropTypes.bool.isRequired,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			handleSubmitForm,
			carouselActive,
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			selectedSiteId,
			siteId,
			translate,
		} = this.props;
		const labelClassName = isSavingSettings || ! carouselActive ? 'is-disabled' : null;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Media' ) }
				/>
				<Card>
					<QueryJetpackConnection siteId={ selectedSiteId } />

					<FormFieldset className="site-settings__formfieldset">
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
							<ToggleControl
								checked={ fields.carousel_display_exif || false }
								disabled={ isRequestingOrSaving || ! carouselActive }
								onChange={ handleAutosavingToggle( 'carousel_display_exif' ) }
								label={ translate( 'Show photo metadata in carousel, when available' ) }
							/>
							<FormLabel className={ labelClassName } htmlFor="carousel_background_color">
								{ translate( 'Background Color' ) }
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

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		carouselActive: !! isJetpackModuleActive( state, selectedSiteId, 'carousel' ),
		selectedSiteId,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( MediaSettingsWriting ) );
