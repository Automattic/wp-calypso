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
import FormToggle from 'calypso/components/forms/form-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import SupportInfo from 'calypso/components/support-info';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

class MediaSettingsWriting extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		// Connected props
		carouselActive: PropTypes.bool.isRequired,
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
			onChangeField,
			selectedSiteId,
			siteId,
			translate,
		} = this.props;
		const labelClassName = isSavingSettings || ! carouselActive ? 'is-disabled' : null;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<Card>
					<QueryJetpackConnection siteId={ selectedSiteId } />

					<FormFieldset className={ 'site-settings__formfieldset' }>
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
							<FormToggle
								checked={ fields.carousel_display_exif || false }
								disabled={ isRequestingOrSaving || ! carouselActive }
								onChange={ handleAutosavingToggle( 'carousel_display_exif' ) }
							>
								{ translate( 'Show photo metadata in carousel, when available' ) }
							</FormToggle>
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
