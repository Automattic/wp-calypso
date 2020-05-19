/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import { getCustomizerUrl, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SupportInfo from 'components/support-info';

class Widgets extends Component {
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

	renderWidgetsSettings() {
		const { selectedSiteId, translate } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<SupportInfo
					text={ translate( 'Provides additional widgets for use on your site.' ) }
					link="https://jetpack.com/support/extra-sidebar-widgets/"
				/>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="widgets"
					label={ translate(
						'Make extra widgets available for use on your site including images and Twitter streams'
					) }
					disabled={ formPending }
				/>
			</FormFieldset>
		);
	}

	renderWidgetVisibilitySettings() {
		const { selectedSiteId, translate } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<SupportInfo
					text={ translate(
						'Widget visibility lets you decide which widgets appear on which pages, so you can finely tailor widget content.'
					) }
					link="https://jetpack.com/support/widget-visibility"
				/>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="widget-visibility"
					label={ translate(
						'Enable widget visibility controls to display widgets only on particular posts or pages'
					) }
					disabled={ formPending }
				/>
			</FormFieldset>
		);
	}

	render() {
		const { translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Fragment>
				<SettingsSectionHeader title={ translate( 'Widgets' ) } />

				<Card className="site-settings">
					{ this.renderWidgetsSettings() }
					<hr />
					{ this.renderWidgetVisibilitySettings() }
				</Card>
			</Fragment>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		selectedSiteId,
		siteIsJetpack: isJetpackSite( state, selectedSiteId ),
		widgetsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'widgets' ),
		widgetVisibilityModuleActive: !! isJetpackModuleActive(
			state,
			selectedSiteId,
			'widget-visibility'
		),
	};
} )( localize( Widgets ) );
