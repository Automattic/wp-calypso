/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { Set } from 'immutable';
import { get, includes, isArray, isEqual, mapValues, omit, overSome, pickBy, partial } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import Button from 'components/button';
import Card from 'components/card';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QuerySiteSettings from 'components/data/query-site-settings';
import CountedTextarea from 'components/forms/counted-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SectionHeader from 'components/section-header';
import MetaTitleEditor from 'components/seo/meta-title-editor';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import WebPreview from 'components/web-preview';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { FEATURE_ADVANCED_SEO, PLAN_BUSINESS } from 'lib/plans/constants';
import { isBusiness, isEnterprise, isJetpackBusiness } from 'lib/products-values';
import { protectForm } from 'lib/protect-form';
import notices from 'notices';
import { recordTracksEvent } from 'state/analytics/actions';
import { activateModule } from 'state/jetpack/modules/actions';
import { getPlugins } from 'state/plugins/installed/selectors';
import { isJetpackModuleActive, isHiddenSite, isPrivateSite } from 'state/selectors';
import { requestSiteSettings, saveSiteSettings } from 'state/site-settings/actions';
import { isSiteSettingsSaveSuccessful, getSiteSettingsSaveError } from 'state/site-settings/selectors';
import { requestSite } from 'state/sites/actions';
import { hasFeature } from 'state/sites/plans/selectors';
import { getSeoTitleFormatsForSite, isJetpackMinimumVersion, isJetpackSite, isRequestingSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

// Basic matching for HTML tags
// Not perfect but meets the needs of this component well
const anyHtmlTag = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

const hasBusinessPlan = overSome( isBusiness, isEnterprise, isJetpackBusiness );

function getGeneralTabUrl( slug ) {
	return `/settings/general/${ slug }`;
}

function getJetpackPluginUrl( slug ) {
	return `/plugins/jetpack/${ slug }`;
}

function stateForSite( site ) {
	return {
		frontPageMetaDescription: get( site, 'options.advanced_seo_front_page_description', '' ),
		isFetchingSettings: get( site, 'fetchingSettings', false )
	};
}

export class SeoForm extends React.Component {
	static displayName = 'SiteSettingsFormSEO';

	state = {
		...stateForSite( this.props.site ),
		seoTitleFormats: this.props.storedTitleFormats,
		// dirtyFields is used to prevent prop updates
		// from overwriting local stateful edits that
		// are in progress and haven't yet been saved
		// to the server
		dirtyFields: Set(),
		invalidatedSiteObject: this.props.selectedSite,
	};

	componentDidMount() {
		this.refreshCustomTitles();
	}

	componentWillReceiveProps( nextProps ) {
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
			return this.setState( {
				...stateForSite( nextSite ),
				seoTitleFormats: nextProps.storedTitleFormats,
				invalidatedSiteObject: nextSite,
				dirtyFields: Set(),
			}, this.refreshCustomTitles );
		}

		let nextState = {
			...stateForSite( nextProps.site ),
			seoTitleFormats: nextProps.storedTitleFormats,
		};

		if ( ! isFetchingSite ) {
			nextState = {
				...nextState,
				seoTitleFormats: nextProps.storedTitleFormats,
				dirtyFields: dirtyFields.delete( 'seoTitleFormats' ),
			};
		}

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			nextState = omit( nextState, [ 'seoTitleFormats' ] );
		}

		// Don't update state for fields the user has edited
		nextState = omit( nextState, dirtyFields.toArray() );

		this.setState( {
			...nextState
		} );
	}

	handleMetaChange = ( { target: { value: frontPageMetaDescription } } ) => {
		const { dirtyFields } = this.state;

		// Don't allow html tags in the input field
		const hasHtmlTagError = anyHtmlTag.test( frontPageMetaDescription );

		this.setState( Object.assign(
			{ hasHtmlTagError },
			! hasHtmlTagError && { frontPageMetaDescription },
			{ dirtyFields: dirtyFields.add( 'frontPageMetaDescription' ) }
		) );
	};

	updateTitleFormats = seoTitleFormats => {
		const { dirtyFields } = this.state;

		this.setState( {
			seoTitleFormats,
			dirtyFields: dirtyFields.add( 'seoTitleFormats' ),
		} );
	};

	submitSeoForm = event => {
		const {
			siteId,
			storedTitleFormats,
			showAdvancedSeo,
			showWebsiteMeta,
		} = this.props;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		this.setState( {
			isSubmittingForm: true
		} );

		// We need to be careful here and only
		// send _changes_ to the API instead of
		// sending all of the title formats.
		// Otherwise there is a race condition
		// where we could accidentally overwrite
		// the settings for types we didn't change.
		const hasChanges = ( format, type ) =>
			! isEqual( format, storedTitleFormats[ type ] );

		const updatedOptions = {
			advanced_seo_title_formats: seoTitleToApi(
				pickBy( this.state.seoTitleFormats, hasChanges )
			),
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
			format => isArray( format ) && 0 === format.length ? '' : format,
		);

		this.props.saveSiteSettings( siteId, updatedOptions );

		this.trackSubmission();
	};

	trackSubmission = () => {
		const { dirtyFields } = this.state;
		const {
			trackFormSubmitted,
			trackTitleFormatsUpdated,
			trackFrontPageMetaUpdated,
		} = this.props;

		trackFormSubmitted();

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			trackTitleFormatsUpdated();
		}

		if ( dirtyFields.has( 'frontPageMetaDescription' ) ) {
			trackFrontPageMetaUpdated();
		}
	};

	refreshCustomTitles = () => {
		const {
			refreshSiteData,
			selectedSite
		} = this.props;

		if ( selectedSite && selectedSite.ID ) {
			this.setState( {
				invalidatedSiteObject: selectedSite,
			}, () => refreshSiteData( selectedSite.ID ) );
		}
	};

	showPreview = () => {
		this.setState( { showPreview: true } );
	};

	hidePreview = () => {
		this.setState( { showPreview: false } );
	};

	getConflictingSeoPlugins = activePlugins => {
		const conflictingSeoPlugins = [
			'Yoast SEO',
			'Yoast SEO Premium',
			'All In One SEO Pack',
			'All in One SEO Pack Pro',
		];

		return activePlugins
			.filter( ( { name } ) => includes( conflictingSeoPlugins, name ) )
			.map( ( { name, slug } ) => ( { name, slug } ) );
	};

	render() {
		const {
			siteId,
			siteIsJetpack,
			jetpackVersionSupportsSeo,
			showAdvancedSeo,
			showWebsiteMeta,
			site,
			isFetchingSite,
			isSeoToolsActive,
			isSitePrivate,
			isSiteHidden,
			activePlugins,
			translate,
		} = this.props;
		const {
			slug = '',
			URL: siteUrl = '',
		} = site;

		const {
			isSubmittingForm,
			isFetchingSettings,
			frontPageMetaDescription,
			showPasteError = false,
			hasHtmlTagError = false,
			invalidCodes = [],
			showPreview = false
		} = this.state;

		const activateSeoTools = () => this.props.activateModule( siteId, 'seo-tools' );
		const isJetpackUnsupported = siteIsJetpack && ! jetpackVersionSupportsSeo;
		const isDisabled = isJetpackUnsupported || isSubmittingForm || isFetchingSettings;
		const isSeoDisabled = isDisabled || isSeoToolsActive === false;
		const isSaveDisabled = isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const generalTabUrl = getGeneralTabUrl( slug );
		const jetpackUpdateUrl = getJetpackPluginUrl( slug );

		const nudgeTitle = siteIsJetpack
			? translate( 'Enable SEO Tools features by upgrading to Jetpack Professional' )
			: translate( 'Enable SEO Tools features by upgrading to the Business Plan' );

		const seoSubmitButton = (
			<Button
				compact={ true }
				onClick={ this.submitSeoForm }
				primary={ true }
				type="submit"
				disabled={ isSaveDisabled || isSeoDisabled }
			>
				{ isSubmittingForm
					? translate( 'Saving…' )
					: translate( 'Save Settings' )
				}
			</Button>
		);

		const conflictedSeoPlugin = siteIsJetpack
			// Let's just pick the first one to keep the notice short.
			? this.getConflictingSeoPlugins( activePlugins )[ 0 ]
			: null;

		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				{
					siteIsJetpack &&
					<QueryJetpackModules siteId={ siteId } />
				}
				<PageViewTracker
					path="/settings/seo/:site"
					title="Site Settings > SEO"
				/>
				{ ( isSitePrivate || isSiteHidden ) && hasBusinessPlan( site.plan ) &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ isSitePrivate
							? translate( "SEO settings aren't recognized by search engines while your site is Private." )
							: translate( "SEO settings aren't recognized by search engines while your site is Hidden." )
						}
					>
						<NoticeAction href={ generalTabUrl }>
							{ translate( 'Privacy Settings' ) }
						</NoticeAction>
					</Notice>
				}

				{ conflictedSeoPlugin &&
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
				}

				{ isJetpackUnsupported &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'SEO Tools require a newer version of Jetpack.'
						) }
					>
						<NoticeAction href={ jetpackUpdateUrl }>
							{ translate( 'Update Now' ) }
						</NoticeAction>
					</Notice>
				}

				{ siteIsJetpack && hasBusinessPlan( site.plan ) && isSeoToolsActive === false &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'SEO Tools module is disabled in Jetpack.'
						) }
					>
						<NoticeAction onClick={ activateSeoTools }>
							{ translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				}

				{ ! this.props.hasAdvancedSEOFeature &&
					<Banner
						description={ translate( 'Adds tools to optimize your site for search engines and social media sharing.' ) }
						event={ 'calypso_seo_settings_upgrade_nudge' }
						feature={ FEATURE_ADVANCED_SEO }
						plan={ PLAN_BUSINESS }
						title={ nudgeTitle }
					/>
				}

				<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
					{ showAdvancedSeo && ! conflictedSeoPlugin &&
						<div>
							<SectionHeader label={ translate( 'Page Title Structure' ) }>
								{ seoSubmitButton }
							</SectionHeader>
							<Card compact className="seo-settings__page-title-header">
								<img className="seo-settings__page-title-header-image" src="/calypso/images/seo/page-title.svg" />
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
					}

					{ ! conflictedSeoPlugin && ( showAdvancedSeo || ( ! siteIsJetpack && showWebsiteMeta ) ) &&
						<div>
							<SectionHeader label={ translate( 'Website Meta' ) }>
								{ seoSubmitButton }
							</SectionHeader>
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
								{ hasHtmlTagError &&
									<FormInputValidation isError={ true } text={ translate( 'HTML tags are not allowed.' ) } />
								}
								<FormSettingExplanation>
									<Button
										className="seo-settings__preview-button"
										onClick={ this.showPreview }
									>
										{ translate( 'Show Previews' ) }
									</Button>
									<span className="seo-settings__preview-explanation">
										{ translate(
											'See how this will look on ' +
											'Google, Facebook, and Twitter.'
										) }
									</span>
								</FormSettingExplanation>
							</Card>
						</div>
					}
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
		/* eslint-enable react/jsx-no-target-blank */
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;
	// SEO Tools are available with Business plan on WordPress.com, and with Premium plan on Jetpack sites
	const isAdvancedSeoEligible = site && site.plan && hasBusinessPlan( site.plan );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const jetpackVersionSupportsSeo = isJetpackMinimumVersion( state, siteId, '4.4-beta1' );
	const isAdvancedSeoSupported = site && ( ! siteIsJetpack || ( siteIsJetpack && jetpackVersionSupportsSeo ) );

	return {
		siteId,
		siteIsJetpack,
		selectedSite: getSelectedSite( state ),
		storedTitleFormats: getSeoTitleFormatsForSite( getSelectedSite( state ) ),
		showAdvancedSeo: isAdvancedSeoEligible && isAdvancedSeoSupported,
		showWebsiteMeta: !! get( site, 'options.advanced_seo_front_page_description', '' ),
		jetpackVersionSupportsSeo: jetpackVersionSupportsSeo,
		isFetchingSite: isRequestingSite( state, siteId ),
		isSeoToolsActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
		isSiteHidden: isHiddenSite( state, siteId ),
		isSitePrivate: isPrivateSite( state, siteId ),
		activePlugins: getPlugins( state, [ siteId ], 'active' ),
		hasAdvancedSEOFeature: hasFeature( state, siteId, FEATURE_ADVANCED_SEO ),
		isSaveSuccess: isSiteSettingsSaveSuccessful( state, siteId ),
		saveError: getSiteSettingsSaveError( state, siteId ),
	};
};

const mapDispatchToProps = {
	refreshSiteData: requestSite,
	requestSiteSettings,
	saveSiteSettings,
	trackFormSubmitted: partial( recordTracksEvent, 'calypso_seo_settings_form_submit' ),
	trackTitleFormatsUpdated: partial( recordTracksEvent, 'calypso_seo_tools_title_formats_updated' ),
	trackFrontPageMetaUpdated: partial( recordTracksEvent, 'calypso_seo_tools_front_page_meta_updated' ),
	activateModule,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( protectForm( localize( SeoForm ) ) );
