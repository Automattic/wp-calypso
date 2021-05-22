/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { getCustomizerUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SupportInfo from 'calypso/components/support-info';

class ThemeEnhancements extends Component {
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
		site: PropTypes.object,
	};

	isFormPending() {
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<ToggleControl
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
				label={ label }
			/>
		);
	}

	renderRadio( name, value, label ) {
		const { fields, handleAutosavingRadio } = this.props;
		return (
			<FormLabel>
				<FormRadio
					name={ name }
					value={ value }
					checked={ value === fields[ name ] }
					onChange={ handleAutosavingRadio( name, value ) }
					disabled={ this.isFormPending() }
					label={ label }
				/>
			</FormLabel>
		);
	}

	renderSimpleSiteInfiniteScrollSettings() {
		const { customizeUrl, fields, translate } = this.props;
		const blockedByFooter = 'footer' === get( fields, 'infinite_scroll_blocked' );

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Infinite scroll' ) }</FormLegend>
				<SupportInfo
					text={ translate( 'Control how additional posts are loaded.' ) }
					link="https://wordpress.com/support/infinite-scroll/"
					privacyLink={ false }
				/>
				{ this.renderToggle(
					'infinite_scroll',
					blockedByFooter,
					translate( 'Load posts as you scroll. Disable to show a clickable button to load posts.' )
				) }
				{ blockedByFooter && (
					<FormSettingExplanation isIndented>
						{ translate(
							'Your site has a "footer" widget enabled so buttons will always be used. {{link}}Customize your site{{/link}}',
							{
								components: {
									link: <a href={ customizeUrl } />,
								},
							}
						) }
					</FormSettingExplanation>
				) }
			</FormFieldset>
		);
	}

	renderJetpackInfiniteScrollSettings() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<SupportInfo
					text={ translate(
						'Loads the next posts automatically when the reader approaches the bottom of the page.'
					) }
					link="https://jetpack.com/support/infinite-scroll/"
				/>
				<FormLegend>{ translate( 'Infinite Scroll' ) }</FormLegend>
				<p>
					{ translate(
						'Create a smooth, uninterrupted reading experience by loading more content as visitors scroll to the bottom of your archive pages.'
					) }
				</p>
				{ this.renderRadio(
					'infinite_scroll',
					'default',
					translate( 'Load more posts using the default theme behavior' )
				) }
				{ this.renderRadio(
					'infinite_scroll',
					'button',
					translate( 'Load more posts in page with a button' )
				) }
				{ this.renderRadio(
					'infinite_scroll',
					'scroll',
					translate( 'Load more posts as the reader scrolls down' )
				) }
			</FormFieldset>
		);
	}

	renderCustomCSSSettings() {
		const { selectedSiteId, translate } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<SupportInfo
					text={ translate(
						"Adds options for CSS preprocessor use, disabling the theme's CSS, or custom image width."
					) }
					link="https://jetpack.com/support/custom-css/"
				/>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="custom-css"
					label={ translate( 'Enhance CSS customization panel' ) }
					disabled={ formPending }
				/>
			</FormFieldset>
		);
	}

	render() {
		const { siteIsJetpack, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<SettingsSectionHeader title={ translate( 'Theme enhancements' ) } />

				<Card className="theme-enhancements__card site-settings">
					{ siteIsJetpack ? (
						<Fragment>
							{ this.renderJetpackInfiniteScrollSettings() }
							<hr />
							{ this.renderCustomCSSSettings() }
						</Fragment>
					) : (
						this.renderSimpleSiteInfiniteScrollSettings()
					) }
				</Card>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const selectedSiteId = get( site, 'ID' );

	return {
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		selectedSiteId,
		siteIsJetpack: isJetpackSite( state, selectedSiteId ),
		site,
	};
} )( localize( ThemeEnhancements ) );
