import { Card, CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { isPluginActive } from 'calypso/state/plugins/installed/selectors-ts';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import {
	isJetpackSite,
	getSiteAdminUrl,
	isJetpackMinimumVersion,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class SpeedUpSiteSettings extends Component {
	static propTypes = {
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		submitForm: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,

		// Connected props
		lazyImagesModuleActive: PropTypes.bool,
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		shouldShowLazyImagesSettings: PropTypes.bool,
		siteAcceleratorStatus: PropTypes.bool,
	};

	handleCdnChange = () => {
		const { siteAcceleratorStatus, submitForm, updateFields } = this.props;

		// If one of them is on, we turn everything off.
		updateFields(
			{
				photon: ! siteAcceleratorStatus,
				'photon-cdn': ! siteAcceleratorStatus,
			},
			submitForm
		);
	};

	render() {
		const {
			isPageOptimizeActive,
			isRequestingSettings,
			isSavingSettings,
			lazyImagesModuleActive,
			pageOptimizeUrl,
			photonModuleUnavailable,
			selectedSiteId,
			shouldShowLazyImagesSettings,
			siteAcceleratorStatus,
			siteIsJetpack,
			siteIsAtomic,
			translate,
		} = this.props;

		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		const lazyImagesSupportUrl = siteIsAtomic
			? localizeUrl(
					'https://wordpress.com/support/settings/performance-settings/#lazy-load-images'
			  )
			: 'https://jetpack.com/support/lazy-images/';
		const lazyImagesDescription = translate(
			'Jetpack’s Lazy Loading feature is no longer necessary.'
		);
		const lazyImagesRecommendation = lazyImagesModuleActive
			? translate(
					'You have the option to disable it on your website, and you will immediately begin benefiting from the native lazy loading feature offered by WordPress itself.'
			  )
			: translate(
					'It is now disabled on your website. You now benefit from the native lazy loading feature offered by WordPress itself.'
			  );

		return (
			<div className="site-settings__module-settings site-settings__speed-up-site-settings">
				<Card>
					<FormFieldset className="site-settings__formfieldset jetpack-site-accelerator-settings">
						<SupportInfo
							text={ translate(
								"Jetpack's global Content Delivery Network (CDN) optimizes " +
									'files and images so your visitors enjoy ' +
									'the fastest experience regardless of device or location.'
							) }
							link={
								siteIsAtomic
									? localizeUrl(
											'https://wordpress.com/support/settings/performance-settings/#enable-site-accelerator'
									  )
									: 'https://jetpack.com/support/site-accelerator/'
							}
							privacyLink={ ! siteIsAtomic }
						/>
						<FormSettingExplanation className="site-settings__feature-description">
							{ translate(
								'Load pages faster by allowing Jetpack to optimize your images and serve your images ' +
									'and static files (like CSS and JavaScript) from our global network of servers.'
							) }
						</FormSettingExplanation>
						<ToggleControl
							checked={ siteAcceleratorStatus }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
							onChange={ this.handleCdnChange }
							label={ translate( 'Enable site accelerator' ) }
						/>
						<div className="site-settings__child-settings">
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon"
								label={ translate( 'Speed up image load times' ) }
								disabled={ isRequestingOrSaving || photonModuleUnavailable }
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon-cdn"
								label={ translate( 'Speed up static file load times' ) }
								disabled={ isRequestingOrSaving }
							/>
						</div>
					</FormFieldset>

					{ siteIsJetpack && shouldShowLazyImagesSettings && (
						<FormFieldset className="site-settings__formfieldset has-divider is-top-only jetpack-lazy-images-settings">
							<Notice
								status="is-info"
								showDismiss={ false }
								text={ translate(
									'Modern browsers now support lazy loading, and WordPress itself bundles lazy loading features for images and videos. This feature will consequently be removed from Jetpack in November.'
								) }
							>
								<NoticeAction href={ lazyImagesSupportUrl } external>
									{ translate( 'Learn more' ) }
								</NoticeAction>
							</Notice>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="lazy-images"
								label={ translate( 'Lazy load images' ) }
								description={ sprintf(
									'%1$s %2$s',
									lazyImagesDescription,
									lazyImagesRecommendation
								) }
								disabled={ isRequestingOrSaving || ! lazyImagesModuleActive }
							/>
						</FormFieldset>
					) }
				</Card>
				{ isPageOptimizeActive && (
					<div className="site-settings__page-optimize">
						<CompactCard href={ pageOptimizeUrl }>
							{ translate( 'Optimize JS and CSS for faster page load and render in the browser.' ) }
						</CompactCard>
					</div>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'photon'
	);
	const photonModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon' );
	const assetCdnModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon-cdn' );
	const lazyImagesModuleActive = isJetpackModuleActive( state, selectedSiteId, 'lazy-images' );

	// Status of the main site accelerator toggle.
	const siteAcceleratorStatus = !! ( photonModuleActive || assetCdnModuleActive );

	return {
		lazyImagesModuleActive,
		photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		selectedSiteId,
		siteAcceleratorStatus,
		siteIsJetpack: isJetpackSite( state, selectedSiteId ),
		isPageOptimizeActive: isPluginActive( state, selectedSiteId, 'page-optimize' ),
		pageOptimizeUrl: getSiteAdminUrl( state, selectedSiteId, 'admin.php?page=page-optimize' ),
		shouldShowLazyImagesSettings: ! isJetpackMinimumVersion( state, selectedSiteId, '12.8' ),
	};
} )( localize( SpeedUpSiteSettings ) );
