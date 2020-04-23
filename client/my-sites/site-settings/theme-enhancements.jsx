/**
 * External dependencies
 */

import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getCustomizerUrl, isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SupportInfo from 'components/support-info';
import versionCompare from 'lib/version-compare';

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

	renderMinilevenSettings() {
		const { minilevenModuleActive, selectedSiteId, site, translate } = this.props;
		const formPending = this.isFormPending();
		const jetpackVersion = get( site, 'options.jetpack_version', 0 );
		const minilevenSupportUrl = 'https://jetpack.com/support/mobile-theme/';
		const googleMobileCheckUrl = `https://search.google.com/test/mobile-friendly?url=${ encodeURIComponent(
			`${ site.URL }?jetpack-preview=responsivetheme`
		) }`;

		return (
			<FormFieldset
				className={ classnames(
					'minileven',
					`${ minilevenModuleActive ? `active` : `inactive` }`
				) }
			>
				<FormLegend>{ translate( 'Mobile Theme' ) }</FormLegend>
				<Notice
					status="is-info"
					showDismiss={ false }
					text={
						minilevenModuleActive &&
						jetpackVersion &&
						versionCompare( jetpackVersion, '8.1-alpha', '>=' )
							? translate(
									'{{b}}Action needed:{{/b}} The Jetpack mobile theme is not supported ' +
										'anymore. It will be removed when you update to the most recent ' +
										'version of the plugin. Please ensure your current theme ' +
										'is mobile-ready {{link}}using this tool{{/link}}. ' +
										'If it is not, consider replacing it.',
									{
										components: {
											b: <strong />,
											link: (
												<a
													href={ googleMobileCheckUrl }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
							  )
							: translate(
									'{{b}}Note:{{/b}} The Jetpack mobile theme is not supported ' +
										'anymore. It will be removed when you update ' +
										'to the most recent version of the plugin.',
									{
										components: {
											b: <strong />,
										},
									}
							  )
					}
				>
					<NoticeAction href={ minilevenSupportUrl } external>
						{ translate( 'Learn more' ) }
					</NoticeAction>
				</Notice>
				<SupportInfo
					text={ translate(
						'Enables a lightweight, mobile-friendly theme ' +
							'that will be displayed to visitors on mobile devices.'
					) }
					link={ minilevenSupportUrl }
				/>
				<p>
					{ translate(
						'Give your site a fast-loading, streamlined look for mobile devices. Visitors will ' +
							'still see your regular theme on other screen sizes.'
					) }
				</p>
				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="minileven"
					label={ translate( 'Enable the Jetpack Mobile theme' ) }
					disabled={ formPending || ! minilevenModuleActive }
				/>

				<div className="theme-enhancements__module-settings site-settings__child-settings">
					{ this.renderToggle(
						'wp_mobile_excerpt',
						! minilevenModuleActive,
						translate( 'Use excerpts instead of full posts on front page and archive pages' )
					) }
					{ this.renderToggle(
						'wp_mobile_featured_images',
						! minilevenModuleActive,
						translate( 'Show featured images' )
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
		const { siteIsJetpack, siteHasMinileven, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<SettingsSectionHeader title={ translate( 'Theme Enhancements' ) } />

				<Card className="theme-enhancements__card site-settings">
					{ siteIsJetpack ? (
						<Fragment>
							{ this.renderJetpackInfiniteScrollSettings() }
							<hr />
							{ siteHasMinileven && (
								<Fragment>
									{ this.renderMinilevenSettings() }
									<hr />
								</Fragment>
							) }
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
		infiniteScrollModuleActive: !! isJetpackModuleActive(
			state,
			selectedSiteId,
			'infinite-scroll'
		),
		minilevenModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'minileven' ),
		site,
		siteHasMinileven: false === isJetpackMinimumVersion( state, selectedSiteId, '8.3-alpha' ),
	};
} )( localize( ThemeEnhancements ) );
