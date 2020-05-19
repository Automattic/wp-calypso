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
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SupportInfo from 'components/support-info';

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
			<div>
				<SettingsSectionHeader title={ translate( 'WP.me Shortlinks' ) } />

				<Card className="shortlinks__card site-settings site-settings__traffic-settings">
					<FormFieldset>
						<SupportInfo
							text={ translate(
								'Generates shorter links so you can have more space to write on social media sites.'
							) }
							link="https://jetpack.com/support/shortlinks/"
						/>

						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="shortlinks"
							label={ translate( 'Generate shortened URLs for simpler sharing.' ) }
							disabled={ formPending }
						/>
					</FormFieldset>
				</Card>
			</div>
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
