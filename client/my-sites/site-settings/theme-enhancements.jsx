/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getCustomizerUrl } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

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
		jetpackSettingsUI: PropTypes.bool,
		fields: PropTypes.object,
	};

	isFormPending() {
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<CompactFormToggle
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</CompactFormToggle>
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
				/>
				<span>{ label }</span>
			</FormLabel>
		);
	}

	renderSimpleSiteInfiniteScrollSettings() {
		const { customizeUrl, fields, translate } = this.props;
		const blockedByFooter = 'footer' === get( fields, 'infinite_scroll_blocked' );

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Infinite Scroll' ) }</FormLegend>

				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position="left">
						{ translate( 'Control how additional posts are loaded.' ) }
						<br />
						<ExternalLink
							href="https://support.wordpress.com/infinite-scroll/"
							icon
							target="_blank"
						>
							{ translate( 'Learn more' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

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
				<FormLegend>{ translate( 'Infinite Scroll' ) }</FormLegend>

				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position="left">
						<ExternalLink href="https://jetpack.com/support/infinite-scroll" icon target="_blank">
							{ translate( 'Learn more about Infinite Scroll.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

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

	renderMinilevenSettings() {
		const { selectedSiteId, minilevenModuleActive, translate } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position="left">
						<ExternalLink href="https://jetpack.com/support/mobile-theme" icon target="_blank">
							{ translate( 'Learn more about Mobile Theme.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="minileven"
					label={ translate( 'Enable the Jetpack Mobile theme' ) }
					disabled={ formPending }
				/>

				<div className="theme-enhancements__module-settings site-settings__child-settings">
					{ this.renderToggle(
						'wp_mobile_excerpt',
						! minilevenModuleActive,
						translate( 'Show excerpts on front page and on archive pages instead of full posts' )
					) }
					{ this.renderToggle(
						'wp_mobile_featured_images',
						! minilevenModuleActive,
						translate( 'Hide all featured images' )
					) }
					{ this.renderToggle(
						'wp_mobile_app_promos',
						! minilevenModuleActive,
						translate(
							'Show an ad for the {{link}}WordPress mobile apps{{/link}} in the footer of the mobile theme',
							{
								components: {
									link: <a href="https://apps.wordpress.com/" />,
								},
							}
						)
					) }
				</div>
			</FormFieldset>
		);
	}

	render() {
		const { jetpackSettingsUI, translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Theme Enhancements' ) } />

				<Card className="theme-enhancements__card site-settings">
					{ jetpackSettingsUI ? (
						<div>
							{ this.renderJetpackInfiniteScrollSettings() }
							<hr />
							{ this.renderMinilevenSettings() }
						</div>
					) : (
						this.renderSimpleSiteInfiniteScrollSettings()
					) }
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		selectedSiteId,
		infiniteScrollModuleActive: !! isJetpackModuleActive(
			state,
			selectedSiteId,
			'infinite-scroll'
		),
		minilevenModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'minileven' ),
	};
} )( localize( ThemeEnhancements ) );
