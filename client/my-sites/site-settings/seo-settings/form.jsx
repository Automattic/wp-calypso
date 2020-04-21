/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get, isArray, isEqual, mapValues, omit, overSome, pickBy, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import MetaTitleEditor from 'components/seo/meta-title-editor';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import notices from 'notices';
import { protectForm } from 'lib/protect-form';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CountedTextarea from 'components/forms/counted-textarea';
import UpsellNudge from 'blocks/upsell-nudge';
import { getSeoTitleFormatsForSite, isJetpackSite, isRequestingSite } from 'state/sites/selectors';
import {
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'state/site-settings/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import isHiddenSite from 'state/selectors/is-hidden-site';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteComingSoon from 'state/selectors/is-site-coming-soon';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSite } from 'state/sites/actions';
import {
	isBusiness,
	isEnterprise,
	isJetpackBusiness,
	isJetpackPremium,
	isEcommerce,
} from 'lib/products-values';
import { hasFeature } from 'state/sites/plans/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import {
	FEATURE_ADVANCED_SEO,
	FEATURE_SEO_PREVIEW_TOOLS,
	TYPE_BUSINESS,
	TYPE_PREMIUM,
	TERM_ANNUALLY,
} from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QuerySiteSettings from 'components/data/query-site-settings';
import { requestSiteSettings, saveSiteSettings } from 'state/site-settings/actions';
import WebPreview from 'components/web-preview';
import { getFirstConflictingPlugin } from 'lib/seo';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import pageTitleImage from 'assets/images/illustrations/seo-page-title.svg';

// Basic matching for HTML tags
// Not perfect but meets the needs of this component well
const anyHtmlTag = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

const hasSupportingPlan = overSome(
	isBusiness,
	isEnterprise,
	isJetpackBusiness,
	isJetpackPremium,
	isEcommerce
);

function getGeneralTabUrl( slug ) {
	return `/settings/general/${ slug }`;
}

function stateForSite( site ) {
	return {
		frontPageMetaDescription: get( site, 'options.advanced_seo_front_page_description', '' ),
		isFetchingSettings: get( site, 'fetchingSettings', false ),
	};
}

export class SeoForm extends React.Component {
	static displayName = 'SiteSettingsFormSEO';

	state = {
		...stateForSite( this.props.selectedSite ),
		seoTitleFormats: this.props.storedTitleFormats,
		// dirtyFields is used to prevent prop updates
		// from overwriting local stateful edits that
		// are in progress and haven't yet been saved
		// to the server
		dirtyFields: new Set(),
		invalidatedSiteObject: this.props.selectedSite,
	};

	componentDidMount() {
		this.refreshCustomTitles();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { selectedSite: prevSite, isFetchingSite, translate } = this.props;
		const { selectedSite: nextSite } = nextProps;
		const { dirtyFields } = this.state;

		// save success
		if ( this.state.isSubmittingForm && nextProps.isSaveSuccess ) {
			this.props.markSaved();
			this.props.requestSiteSettings( nextProps.siteId );
			this.refreshCustomTitles();
			this.setState( { isSubmittingForm: false } );
		}

		// save error
		if ( this.state.isSubmittingForm && nextProps.saveError ) {
			this.setState( { isSubmittingForm: false } );
			notices.error( translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		// if we are changing sites, everything goes
		if ( prevSite.ID !== nextSite.ID ) {
			return this.setState(
				{
					...stateForSite( nextSite ),
					seoTitleFormats: nextProps.storedTitleFormats,
					invalidatedSiteObject: nextSite,
					dirtyFields: new Set(),
				},
				this.refreshCustomTitles
			);
		}

		let nextState = {
			...stateForSite( nextProps.selectedSite ),
			seoTitleFormats: nextProps.storedTitleFormats,
		};

		if ( ! isFetchingSite ) {
			const nextDirtyFields = new Set( dirtyFields );
			nextDirtyFields.delete( 'seoTitleFormats' );

			nextState = {
				...nextState,
				seoTitleFormats: nextProps.storedTitleFormats,
				dirtyFields: nextDirtyFields,
			};
		}

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			nextState = omit( nextState, [ 'seoTitleFormats' ] );
		}

		// Don't update state for fields the user has edited
		nextState = omit( nextState, Array.from( dirtyFields ) );

		this.setState( nextState );
	}

	handleMetaChange = ( { target: { value: frontPageMetaDescription } } ) => {
		const dirtyFields = new Set( this.state.dirtyFields );
		dirtyFields.add( 'frontPageMetaDescription' );

		// Don't allow html tags in the input field
		const hasHtmlTagError = anyHtmlTag.test( frontPageMetaDescription );

		this.setState(
			Object.assign(
				{ dirtyFields, hasHtmlTagError },
				! hasHtmlTagError && { frontPageMetaDescription }
			)
		);
	};

	updateTitleFormats = ( seoTitleFormats ) => {
		const dirtyFields = new Set( this.state.dirtyFields );
		dirtyFields.add( 'seoTitleFormats' );

		this.setState( {
			seoTitleFormats,
			dirtyFields,
		} );
	};

	submitSeoForm = ( event ) => {
		const { siteId, storedTitleFormats, showAdvancedSeo, showWebsiteMeta } = this.props;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		this.setState( {
			isSubmittingForm: true,
		} );

		// We need to be careful here and only
		// send _changes_ to the API instead of
		// sending all of the title formats.
		// Otherwise there is a race condition
		// where we could accidentally overwrite
		// the settings for types we didn't change.
		const hasChanges = ( format, type ) => ! isEqual( format, storedTitleFormats[ type ] );

		const updatedOptions = {
			advanced_seo_title_formats: seoTitleToApi( pickBy( this.state.seoTitleFormats, hasChanges ) ),
		};

		// Update this option only if advanced SEO is enabled or grandfathered in order to
		// avoid request errors on non-business sites when they attempt site verification
		// services update
		if ( showAdvancedSeo || showWebsiteMeta ) {
			updatedOptions.advanced_seo_front_page_description = this.state.frontPageMetaDescription;
		}

		// Since the absence of data indicates that there are no changes in the network request
		// we need to send an indicator that we specifically want to clear the format
		// We will pass an empty string in this case.
		updatedOptions.advanced_seo_title_formats = mapValues(
			updatedOptions.advanced_seo_title_formats,
			( format ) => ( isArray( format ) && 0 === format.length ? '' : format)
		);

		this.props.saveSiteSettings( siteId, updatedOptions );

		this.trackSubmission();
	};

	trackSubmission = () => {
		const { dirtyFields } = this.state;
		const {
			path,
			trackFormSubmitted,
			trackTitleFormatsUpdated,
			trackFrontPageMetaUpdated,
		} = this.props;

		trackFormSubmitted( { path } );

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			trackTitleFormatsUpdated( { path } );
		}

		if ( dirtyFields.has( 'frontPageMetaDescription' ) ) {
			trackFrontPageMetaUpdated( { path } );
		}
	};

	refreshCustomTitles = () => {
		const { refreshSiteData, selectedSite, siteId } = this.props;

		this.setState(
			{
				invalidatedSiteObject: selectedSite,
			},
			() => refreshSiteData( siteId )
		);
	};

	showPreview = () => {
		this.setState( { showPreview: true } );
	};

	hidePreview = () => {
		this.setState( { showPreview: false } );
	};

	render() {
		const {
			conflictedSeoPlugin,
			isFetchingSite,
			siteId,
			siteIsJetpack,
			siteIsComingSoon,
			showAdvancedSeo,
			showWebsiteMeta,
			selectedSite,
			isSeoToolsActive,
			isSitePrivate,
			isSiteHidden,
			translate,
		} = this.props;
		const { slug = '', URL: siteUrl = '' } = selectedSite;

		const {
			isSubmittingForm,
			isFetchingSettings,
			frontPageMetaDescription,
			showPasteError = false,
			hasHtmlTagError = false,
			invalidCodes = [],
			showPreview = false,
		} = this.state;

		const isDisabled = isSubmittingForm || isFetchingSettings;
		const isSeoDisabled = isDisabled || isSeoToolsActive === false;
		const isSaveDisabled =
			isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const generalTabUrl = getGeneralTabUrl( slug );

		const nudgeTitle = siteIsJetpack
			? translate(
					'Boost your search engine ranking with the powerful SEO tools in Jetpack Premium'
			  )
			: translate(
					'Boost your search engine ranking with the powerful SEO tools in the Business plan'
			  );

		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }
				{ ( isSitePrivate || isSiteHidden ) && hasSupportingPlan( selectedSite.plan ) && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ ( function () {
							if ( isSitePrivate ) {
								if ( siteIsComingSoon ) {
									return translate(
										"SEO settings aren't recognized by search engines while your site is Coming Soon."
									);
								}

								return translate(
									"SEO settings aren't recognized by search engines while your site is Private."
								);
							}
							return translate(
								"SEO settings aren't recognized by search engines while your site is Hidden."
							);
						} )() }
					>
						<NoticeAction href={ generalTabUrl }>{ translate( 'Privacy Settings' ) }</NoticeAction>
					</Notice>
				) }
				{ conflictedSeoPlugin && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your SEO settings are managed by the following plugin: %(pluginName)s',
							{ args: { pluginName: conflictedSeoPlugin.name } }
						) }
					>
						<NoticeAction href={ `/plugins/${ conflictedSeoPlugin.slug }/${ slug }` }>
							{ translate( 'View Plugin' ) }
						</NoticeAction>
					</Notice>
				) }

				{ ! this.props.hasSeoPreviewFeature &&
					! this.props.hasAdvancedSEOFeature &&
					selectedSite.plan && (
						<UpsellNudge
							description={ translate(
								'Get tools to optimize your site for improved performance in search engine results.'
							) }
							event={ 'calypso_seo_settings_upgrade_nudge' }
							feature={ siteIsJetpack ? FEATURE_SEO_PREVIEW_TOOLS : FEATURE_ADVANCED_SEO }
							plan={ findFirstSimilarPlanKey( selectedSite.plan.product_slug, {
								type: siteIsJetpack ? TYPE_PREMIUM : TYPE_BUSINESS,
								...( siteIsJetpack ? { term: TERM_ANNUALLY } : {} ),
							} ) }
							showIcon={ true }
							title={ nudgeTitle }
						/>
					) }
				<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
					{ showAdvancedSeo && ! conflictedSeoPlugin && (
						<div>
							<SettingsSectionHeader
								disabled={ isSaveDisabled || isSeoDisabled }
								isSaving={ isSubmittingForm }
								onButtonClick={ this.submitSeoForm }
								showButton
								title={ translate( 'Page Title Structure' ) }
							/>
							<Card compact className="seo-settings__page-title-header">
								<img
									className="seo-settings__page-title-header-image"
									src={ pageTitleImage }
									alt=""
								/>
								<p className="seo-settings__page-title-header-text">
									{ translate(
										'You can set the structure of page titles for different sections of your site. ' +
											'Doing this will change the way your site title is displayed in search engines, ' +
											'social media sites, and browser tabs.'
									) }
								</p>
							</Card>
							<Card>
								<MetaTitleEditor
									disabled={ isFetchingSite || isSeoDisabled }
									onChange={ this.updateTitleFormats }
									titleFormats={ this.state.seoTitleFormats }
								/>
							</Card>
						</div>
					) }

					{ ! conflictedSeoPlugin &&
						( showAdvancedSeo || ( ! siteIsJetpack && showWebsiteMeta ) ) && (
							<div>
								<SettingsSectionHeader
									disabled={ isSaveDisabled || isSeoDisabled }
									isSaving={ isSubmittingForm }
									onButtonClick={ this.submitSeoForm }
									showButton
									title={ translate( 'Website Meta' ) }
								/>
								<Card>
									<p>
										{ translate(
											'Craft a description of your Website up to 160 characters that will be used in ' +
												'search engine results for your front page, and when your website is shared ' +
												'on social media sites.'
										) }
									</p>
									<FormLabel htmlFor="advanced_seo_front_page_description">
										{ translate( 'Front Page Meta Description' ) }
									</FormLabel>
									<CountedTextarea
										name="advanced_seo_front_page_description"
										type="text"
										id="advanced_seo_front_page_description"
										value={ frontPageMetaDescription || '' }
										disabled={ isSeoDisabled }
										maxLength="300"
										acceptableLength={ 159 }
										onChange={ this.handleMetaChange }
										className="seo-settings__front-page-description"
									/>
									{ hasHtmlTagError && (
										<FormInputValidation
											isError={ true }
											text={ translate( 'HTML tags are not allowed.' ) }
										/>
									) }
									<FormSettingExplanation>
										<Button className="seo-settings__preview-button" onClick={ this.showPreview }>
											{ translate( 'Show Previews' ) }
										</Button>
										<span className="seo-settings__preview-explanation">
											{ translate(
												'See how this will look on ' + 'Google, Facebook, and Twitter.'
											) }
										</span>
									</FormSettingExplanation>
								</Card>
							</div>
						) }
				</form>
				<WebPreview
					showPreview={ showPreview }
					onClose={ this.hidePreview }
					previewUrl={ siteUrl }
					showDeviceSwitcher={ false }
					showExternal={ false }
					defaultViewportDevice="seo"
					frontPageMetaDescription={ this.state.frontPageMetaDescription || null }
				/>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSite = getSelectedSite( state );
	// SEO Tools are available with Business plan on WordPress.com, and with Premium plan on Jetpack sites
	const isAdvancedSeoEligible = selectedSite.plan && hasSupportingPlan( selectedSite.plan );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );

	const activePlugins = getPlugins( state, [ siteId ], 'active' );
	const conflictedSeoPlugin = siteIsJetpack
		? getFirstConflictingPlugin( activePlugins ) // Pick first one to keep the notice short.
		: null;
	return {
		conflictedSeoPlugin,
		isFetchingSite: isRequestingSite( state, siteId ),
		siteId,
		siteIsJetpack,
		selectedSite,
		storedTitleFormats: getSeoTitleFormatsForSite( getSelectedSite( state ) ),
		showAdvancedSeo: isAdvancedSeoEligible,
		showWebsiteMeta: !! get( selectedSite, 'options.advanced_seo_front_page_description', '' ),
		isSeoToolsActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
		isSiteHidden: isHiddenSite( state, siteId ),
		isSitePrivate: isPrivateSite( state, siteId ),
		siteIsComingSoon: isSiteComingSoon( state, siteId ),
		hasAdvancedSEOFeature: hasFeature( state, siteId, FEATURE_ADVANCED_SEO ),
		hasSeoPreviewFeature: hasFeature( state, siteId, FEATURE_SEO_PREVIEW_TOOLS ),
		isSaveSuccess: isSiteSettingsSaveSuccessful( state, siteId ),
		saveError: getSiteSettingsSaveError( state, siteId ),
		path: getCurrentRouteParameterized( state, siteId ),
	};
};

const mapDispatchToProps = {
	refreshSiteData: requestSite,
	requestSiteSettings,
	saveSiteSettings,
	trackFormSubmitted: partial( recordTracksEvent, 'calypso_seo_settings_form_submit' ),
	trackTitleFormatsUpdated: partial( recordTracksEvent, 'calypso_seo_tools_title_formats_updated' ),
	trackFrontPageMetaUpdated: partial(
		recordTracksEvent,
		'calypso_seo_tools_front_page_meta_updated'
	),
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( protectForm( localize( SeoForm ) ) );
