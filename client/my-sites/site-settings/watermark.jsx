import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormLabel from 'calypso/components/forms/form-label';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MediaSettingsWatermark extends Component {
	static propTypes = {
		fields: PropTypes.object,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		// Connected props
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	render() {
		const { fields, isRequestingSettings, isSavingSettings, onChangeField, translate } = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;
		const watermarkIdentifier = 'display_watermark';

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<Card>
					<FormFieldset className={ 'site-settings__formfieldset' }>
						<FormLabel htmlFor={ watermarkIdentifier }>{ translate( 'Watermark text' ) }</FormLabel>
						<FormTextInput
							name={ watermarkIdentifier }
							id={ watermarkIdentifier }
							value={ fields.display_watermark }
							onChange={ onChangeField( watermarkIdentifier ) }
							disabled={ isRequestingOrSaving }
						/>
						<FormSettingExplanation>
							{ translate( "Overlay a text watermark on top of your site's images." ) }
						</FormSettingExplanation>
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( MediaSettingsWatermark ) );
