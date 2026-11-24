import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
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
			<PanelCard>
				<>
					<PanelCardHeading>
						{ translate( 'WP.me Shortlinks' ) }
						<SupportInfo
							text={ translate(
								'Generates shorter links so you can have more space to write on social media sites.'
							) }
							link="https://jetpack.com/support/wp-me-shortlinks/"
						/>
					</PanelCardHeading>
					<FormFieldset>
						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="shortlinks"
							label={ translate( 'Generate shortened URLs for simpler sharing.' ) }
							disabled={ formPending }
						/>
					</FormFieldset>
				</>
			</PanelCard>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
	};
} )( localize( Shortlinks ) );
