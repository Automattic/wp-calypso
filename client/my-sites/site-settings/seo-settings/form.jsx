import {
	FEATURE_ADVANCED_SEO,
	FEATURE_SEO_PREVIEW_TOOLS,
	TYPE_BUSINESS,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import { Card, Button, FormInputValidation } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, isEqual, mapValues, pickBy } from 'lodash';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import pageTitleImage from 'calypso/assets/images/illustrations/seo-page-title.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import CountedTextarea from 'calypso/components/forms/counted-textarea';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import MetaTitleEditor from 'calypso/components/seo/meta-title-editor';
import { toApi as seoTitleToApi } from 'calypso/components/seo/meta-title-editor/mappings';
import WebPreview from 'calypso/components/web-preview';
import { protectForm } from 'calypso/lib/protect-form';
import { getFirstConflictingPlugin } from 'calypso/lib/seo';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isHiddenSite from 'calypso/state/selectors/is-hidden-site';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSiteSettings, saveSiteSettings } from 'calypso/state/site-settings/actions';
import {
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
	isRequestingSiteSettings,
	isSavingSiteSettings,
} from 'calypso/state/site-settings/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import {
	getSeoTitleFormatsForSite,
	isJetpackSite,
	isRequestingSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

// Basic matching for HTML tags
// Not perfect but meets the needs of this component well
const anyHtmlTag = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

function getGeneralTabUrl( slug ) {
	return `/settings/general/${ slug }`;
}

export class SiteSettingsFormSEO extends Component {
	_mounted = createRef();

	state = {
		dirtyFields: new Set(),
	};

	static getDerivedStateFromProps( props, state ) {
		const { dirtyFields } = state;
		const nextState = {};

		if (
			! dirtyFields.has( 'seoTitleFormats' ) &&
			! isEqual( props.storedTitleFormats, state.seoTitleFormats )
		) {
			nextState.seoTitleFormats = props.storedTitleFormats;
		}

		if (
			! dirtyFields.has( 'frontPageMetaDescription' ) &&
			! isEqual(
				props.selectedSite.options?.advanced_seo_front_page_description,
				state.frontPageMetaDescription
			)
		) {
			nextState.frontPageMetaDescription =
				props.selectedSite.options?.advanced_seo_front_page_description;
		}

		if ( Object.keys( nextState ).length > 0 ) {
			return nextState;
		}

		return null;
	}

	componentDidMount() {
		this.refreshCustomTitles();
	}

	handleSubmitSuccess() {
		this.props.markSaved();
		this.props.requestSiteSettings( this.props.siteId );
		this.refreshCustomTitles();

		if ( this._mounted ) {
			this.setState( { dirtyFields: new Set() } );
		}
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

		this.props.removeNotice( 'seo-settings-form-error' );

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
			( format ) => ( Array.isArray( format ) && 0 === format.length ? '' : format )
		);

		this.props.saveSiteSettings( siteId, updatedOptions ).then( ( res ) => {
			if ( res.updated ) {
				this.handleSubmitSuccess();
			}
		} );

		this.trackSubmission();
	};

	trackSubmission = () => {
		const { dirtyFields } = this.state;
		const { path, trackFormSubmitted, trackTitleFormatsUpdated, trackFrontPageMetaUpdated } =
			this.props;

		trackFormSubmitted( { path } );

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			trackTitleFormatsUpdated( { path } );
		}

		if ( dirtyFields.has( 'frontPageMetaDescription' ) ) {
			trackFrontPageMetaUpdated( { path } );
		}
	};

	refreshCustomTitles = () => {
		const { refreshSiteData, siteId } = this.props;

		refreshSiteData( siteId );
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
			isAtomic,
			showWebsiteMeta,
			selectedSite,
			isSeoToolsActive,
			isSitePrivate,
			isSiteHidden,
			translate,
			isFetchingSettings,
			isSavingSettings,
		} = this.props;
		const { slug = '', URL: siteUrl = '' } = selectedSite;

		const {
			frontPageMetaDescription,
			showPasteError = false,
			hasHtmlTagError = false,
			invalidCodes = [],
			showPreview = false,
		} = this.state;

		const isDisabled = isSavingSettings || isFetchingSettings;
		const isSeoDisabled = isDisabled || isSeoToolsActive === false;
		const isSaveDisabled =
			isDisabled || isSavingSettings || ( ! showPasteError && invalidCodes.length > 0 );

		const generalTabUrl = getGeneralTabUrl( slug );

		const upsellProps =
			siteIsJetpack && ! isAtomic
				? {
						title: translate( 'Boost your search engine ranking' ),
						feature: FEATURE_SEO_PREVIEW_TOOLS,
						href: `/checkout/${ slug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_ADVANCED_SEO ] }`,
				  }
				: {
						title: translate(
							'Boost your search engine ranking with the powerful SEO tools in the Business plan'
						),
						feature: FEATURE_ADVANCED_SEO,
						plan:
							selectedSite.plan &&
							findFirstSimilarPlanKey( selectedSite.plan.product_slug, {
								type: TYPE_BUSINESS,
							} ),
				  };

		// To ensure two Coming Soon badges don't appear while sites with Coming Soon v1 (isSitePrivate && siteIsComingSoon) still exist.
		const isPublicComingSoon = ! isSitePrivate && siteIsComingSoon;

		return (
			<div ref={ this._mounted }>
				<QuerySiteSettings siteId={ siteId } />
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }
				{ ( isSitePrivate || isSiteHidden ) && showAdvancedSeo && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ ( function () {
							if ( isSitePrivate ) {
								return translate(
									"SEO settings aren't recognized by search engines while your site is Private."
								);
							} else if ( isPublicComingSoon ) {
								return translate(
									"SEO settings aren't recognized by search engines while your site is Coming Soon."
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
				{ ! showAdvancedSeo && selectedSite.plan && (
					<UpsellNudge
						feature={ FEATURE_ADVANCED_SEO }
						forceDisplay={ siteIsJetpack }
						{ ...upsellProps }
						description={ translate(
							'Get tools to optimize your site for improved search engine results.'
						) }
						event={ 'calypso_seo_settings_upgrade_nudge' }
						showIcon={ true }
					/>
				) }
				<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
					{ showAdvancedSeo && ! conflictedSeoPlugin && (
						<div>
							<SettingsSectionHeader
								disabled={ isSaveDisabled || isSeoDisabled }
								isSaving={ isSavingSettings }
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
									isSaving={ isSavingSettings }
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
		showAdvancedSeo: siteHasFeature( state, siteId, FEATURE_ADVANCED_SEO ),
		isAtomic: isAtomicSite( state, siteId ),
		showWebsiteMeta: !! get( selectedSite, 'options.advanced_seo_front_page_description', '' ),
		isSeoToolsActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
		isSiteHidden: isHiddenSite( state, siteId ),
		isSitePrivate: isPrivateSite( state, siteId ),
		siteIsComingSoon: isSiteComingSoon( state, siteId ),
		isSaveSuccess: isSiteSettingsSaveSuccessful( state, siteId ),
		saveError: getSiteSettingsSaveError( state, siteId ),
		path: getCurrentRouteParameterized( state, siteId ),
		isFetchingSettings: isRequestingSiteSettings( state, siteId ),
		isSavingSettings: isSavingSiteSettings( state, siteId ),
	};
};

const mapDispatchToProps = {
	errorNotice,
	removeNotice,
	refreshSiteData: requestSite,
	requestSiteSettings,
	saveSiteSettings,
	trackFormSubmitted: ( properties ) =>
		recordTracksEvent( 'calypso_seo_settings_form_submit', properties ),
	trackTitleFormatsUpdated: ( properties ) =>
		recordTracksEvent( 'calypso_seo_tools_title_formats_updated', properties ),
	trackFrontPageMetaUpdated: ( properties ) =>
		recordTracksEvent( 'calypso_seo_tools_front_page_meta_updated', properties ),
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( protectForm( localize( SiteSettingsFormSEO ) ) );
