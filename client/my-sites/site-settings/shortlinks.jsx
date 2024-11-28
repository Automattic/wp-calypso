import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { PanelHeading, PanelSection } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class Shortlinks extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		onSubmitForm: PropTypes.func.isRequired,
		handleAutosavingToggle: PropTypes.func.isRequired,
		handleAutosavingRadio: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	isFormPending = () => this.props.isRequestingSettings || this.props.isSavingSettings;

	render() {
		const { selectedSiteId, translate } = this.props;
		const formPending = this.isFormPending();

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<PanelSection>
				<>
					<PanelHeading>
						{ translate( 'WP.me Shortlinks' ) }
						<SupportInfo
							text={ translate(
								'Generates shorter links so you can have more space to write on social media sites.'
							) }
							link="https://jetpack.com/support/wp-me-shortlinks/"
						/>
					</PanelHeading>
					<FormFieldset>
						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="shortlinks"
							label={ translate( 'Generate shortened URLs for simpler sharing.' ) }
							disabled={ formPending }
						/>
					</FormFieldset>
				</>
			</PanelSection>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'shortlinks'
	);

	return {
		selectedSiteId,
		shortlinksModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'shortlinks' ),
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Shortlinks ) );
