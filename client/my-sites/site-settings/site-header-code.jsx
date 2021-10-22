import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class SiteHeaderCode extends Component {
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
		const siteHeaderId = 'site_header_code';

		return (
			<div className="site-settings__module-settings site-settings__general-settings">
				<Card>
					<FormFieldset className={ 'site-settings__formfieldset' }>
						<FormSettingExplanation>
							{ translate( 'Add code to your site header.' ) }
						</FormSettingExplanation>
						<TextareaAutosize
							name={ siteHeaderId }
							id={ siteHeaderId }
							value={ fields.site_header_code }
							onChange={ onChangeField }
							disabled={ isRequestingOrSaving }
						/>
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
} )( localize( SiteHeaderCode ) );
