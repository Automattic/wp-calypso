import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class Protect extends Component {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
		disableProtect: PropTypes.bool,
	};

	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			protectModuleUnavailable,
			selectedSiteId,
			translate,
		} = this.props;

		return (
			<Card>
				<FormFieldset>
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="protect"
						label={ translate( 'Enable brute force login protection' ) }
						disabled={ isRequestingSettings || isSavingSettings || protectModuleUnavailable }
					/>
					<FormSettingExplanation isIndented>
						{ translate(
							'Prevent and block unwanted login attempts from bots and hackers attempting to log in to your website with common username and password combinations.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
			</Card>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'protect'
	);

	return {
		selectedSiteId,
		protectModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'protect' ),
		protectModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Protect ) );
