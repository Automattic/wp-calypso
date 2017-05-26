/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import {
	get,
	includes,
	isArray,
	isEqual,
	isString,
	mapValues,
	omit,
	overSome,
	pickBy,
	partial
} from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import ExternalLink from 'components/external-link';
import MetaTitleEditor from 'components/seo/meta-title-editor';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import notices from 'notices';
import { protectForm } from 'lib/protect-form';
import FormInput from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CountedTextarea from 'components/forms/counted-textarea';
import Banner from 'components/banner';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import {
	getSeoTitleFormatsForSite,
	isJetpackMinimumVersion,
	isJetpackSite,
	isRequestingSite,
} from 'state/sites/selectors';
import {
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'state/site-settings/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import {
	isJetpackModuleActive,
	isHiddenSite,
	isPrivateSite,
} from 'state/selectors';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import { recordTracksEvent } from 'state/analytics/actions';
import WebPreview from 'components/web-preview';
import { requestSite } from 'state/sites/actions';
import { activateModule } from 'state/jetpack/modules/actions';
import {
	isBusiness,
	isEnterprise,
	isJetpackBusiness
} from 'lib/products-values';
import { hasFeature } from 'state/sites/plans/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { FEATURE_ADVANCED_SEO, PLAN_BUSINESS } from 'lib/plans/constants';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QuerySiteSettings from 'components/data/query-site-settings';
import {
	requestSiteSettings,
	saveSiteSettings
} from 'state/site-settings/actions';

const serviceIds = {
	google: 'google-site-verification',
	bing: 'msvalidate.01',
	pinterest: 'p:domain_verify',
	yandex: 'yandex-verification'
};

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
		googleCode: get( site, 'options.verification_services_codes.google', '' ),
		bingCode: get( site, 'options.verification_services_codes.bing', '' ),
		pinterestCode: get( site, 'options.verification_services_codes.pinterest', '' ),
		yandexCode: get( site, 'options.verification_services_codes.yandex', '' ),
		isFetchingSettings: get( site, 'fetchingSettings', false )
	};
}

function getMetaTag( serviceName = '', content = '' ) {
	if ( ! content ) {
		return '';
	}

	if ( includes( content, '<meta' ) ) {
		// We were passed a meta tag already!
		return content;
	}

	return `<meta name="${ get( serviceIds, serviceName, '' ) }" content="${ content }" />`;
}

function isValidCode( serviceName = '', content = '' ) {
	if ( ! content.length ) {
		return true;
	}

	content = getMetaTag( serviceName, content );

	return includes( content, serviceIds[ serviceName ] );
}

export const SeoForm = React.createClass( {
	displayName: 'SiteSettingsFormSEO',

	getInitialState() {
		return {
			...stateForSite( this.props.site ),
			seoTitleFormats: this.props.storedTitleFormats,
			// dirtyFields is used to prevent prop updates
			// from overwriting local stateful edits that
			// are in progress and haven't yet been saved
			// to the server
			dirtyFields: Set(),
			invalidatedSiteObject: this.props.selectedSite,
		};
	},

	componentWillMount() {
		this.changeGoogleCode = this.handleVerificationCodeChange( 'googleCode' );
		this.changeBingCode = this.handleVerificationCodeChange( 'bingCode' );
		this.changePinterestCode = this.handleVerificationCodeChange( 'pinterestCode' );
		this.changeYandexCode = this.handleVerificationCodeChange( 'yandexCode' );
	},

	componentDidMount() {
		this.refreshCustomTitles();
	},

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
	},

	handleMetaChange( { target: { value: frontPageMetaDescription } } ) {
		const { dirtyFields } = this.state;

		// Don't allow html tags in the input field
		const hasHtmlTagError = anyHtmlTag.test( frontPageMetaDescription );

		this.setState( Object.assign(
			{ hasHtmlTagError },
			! hasHtmlTagError && { frontPageMetaDescription },
			{ dirtyFields: dirtyFields.add( 'frontPageMetaDescription' ) }
		) );
	},

	handleVerificationCodeChange( serviceCode ) {
		return event => {
			const { dirtyFields } = this.state;

			if ( ! this.state.hasOwnProperty( serviceCode ) ) {
				return;
			}

			// Show an error if the user types into the field
			if ( event.target.value.length === 1 ) {
				this.setState( {
					showPasteError: true,
					invalidCodes: [ serviceCode.replace( 'Code', '' ) ]
				} );
				return;
			}

			this.setState( {
				invalidCodes: [],
				showPasteError: false,
				[ serviceCode ]: event.target.value,
				dirtyFields: dirtyFields.add( serviceCode )
			} );
		};
	},

	updateTitleFormats( seoTitleFormats ) {
		const { dirtyFields } = this.state;

		this.setState( {
			seoTitleFormats,
			dirtyFields: dirtyFields.add( 'seoTitleFormats' ),
		} );
	},

	submitSeoForm( event ) {
		const {
			siteId,
			storedTitleFormats,
			showAdvancedSeo,
			showWebsiteMeta,
			translate,
		} = this.props;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		const verificationCodes = {
			google: this.state.googleCode,
			bing: this.state.bingCode,
			pinterest: this.state.pinterestCode,
			yandex: this.state.yandexCode
		};

		const filteredCodes = pickBy( verificationCodes, isString );
		const invalidCodes = Object.keys(
			pickBy(
				filteredCodes,
				( name, content ) => ! isValidCode( content, name )
			)
		);

		this.setState( { invalidCodes } );
		if ( invalidCodes.length > 0 ) {
			notices.error( translate( 'Invalid site verification tag entered.' ) );
			return;
		}

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
			verification_services_codes: filteredCodes
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
	},

	trackSubmission() {
		const { dirtyFields } = this.state;
		const {
			trackFormSubmitted,
			trackTitleFormatsUpdated,
			trackFrontPageMetaUpdated
		} = this.props;

		trackFormSubmitted();

		if ( dirtyFields.has( 'seoTitleFormats' ) ) {
			trackTitleFormatsUpdated();
		}

		if ( dirtyFields.has( 'frontPageMetaDescription' ) ) {
			trackFrontPageMetaUpdated();
		}
	},

	refreshCustomTitles() {
		const {
			refreshSiteData,
			selectedSite
		} = this.props;

		if ( selectedSite && selectedSite.ID ) {
			this.setState( {
				invalidatedSiteObject: selectedSite,
			}, () => refreshSiteData( selectedSite.ID ) );
		}
	},

	getVerificationError( isPasteError ) {
		const { translate } = this.props;
		return (
			<FormInputValidation isError={ true } text={
				isPasteError
					? translate( 'Verification code should be copied and pasted into this field.' )
					: translate( 'Invalid site verification tag.' )
			} />
		);
	},

	showPreview() {
		this.setState( { showPreview: true } );
	},

	hidePreview() {
		this.setState( { showPreview: false } );
	},

	getConflictingSeoPlugins( activePlugins ) {
		const conflictingSeoPlugins = [
			'Yoast SEO',
			'Yoast SEO Premium',
			'All In One SEO Pack',
			'All in One SEO Pack Pro',
		];

		return activePlugins
			.filter( ( { name } ) => includes( conflictingSeoPlugins, name ) )
			.map( ( { name, slug } ) => ( { name, slug } ) );
	},

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
			isVerificationToolsActive,
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

		let { googleCode, bingCode, pinterestCode, yandexCode } = this.state;

		const activateSeoTools = () => this.props.activateModule( siteId, 'seo-tools' );
		const activateVerificationServices = () => this.props.activateModule( siteId, 'verification-tools' );
		const isJetpackUnsupported = siteIsJetpack && ! jetpackVersionSupportsSeo;
		const isDisabled = isJetpackUnsupported || isSubmittingForm || isFetchingSettings;
		const isSeoDisabled = isDisabled || isSeoToolsActive === false;
		const isVerificationDisabled = isDisabled || isVerificationToolsActive === false;
		const isSaveDisabled = isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const generalTabUrl = getGeneralTabUrl( slug );
		const jetpackUpdateUrl = getJetpackPluginUrl( slug );
		const placeholderTagContent = '1234';

		// The API returns 'false' for an empty array value, so we force it to an empty string if needed
		googleCode = getMetaTag( 'google', googleCode || '' );
		bingCode = getMetaTag( 'bing', bingCode || '' );
		pinterestCode = getMetaTag( 'pinterest', pinterestCode || '' );
		yandexCode = getMetaTag( 'yandex', yandexCode || '' );

		const hasError = function( service ) {
			return includes( invalidCodes, service );
		};

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
			: false;

		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
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

					{ siteIsJetpack && isVerificationToolsActive === false &&
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Site Verification Services are disabled in Jetpack.'
							) }
						>
							<NoticeAction onClick={ activateVerificationServices }>
								{ translate( 'Enable' ) }
							</NoticeAction>
						</Notice>
					}

					<SectionHeader label={ translate( 'Site Verification Services' ) }>
						<Button
							compact
							primary
							onClick={ this.submitSeoForm }
							type="submit"
							disabled={ isSaveDisabled || isVerificationDisabled }
						>
							{ isSubmittingForm
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
						</Button>
					</SectionHeader>
					<Card>
						<p>
							{ translate(
								'Note that {{b}}verifying your site with these services is not necessary{{/b}} in order' +
								' for your site to be indexed by search engines. To use these advanced search engine tools' +
								' and verify your site with a service, paste the HTML Tag code below. Read the' +
								' {{support}}full instructions{{/support}} if you are having trouble. Supported verification services:' +
								' {{google}}Google Search Console{{/google}}, {{bing}}Bing Webmaster Center{{/bing}},' +
								' {{pinterest}}Pinterest Site Verification{{/pinterest}}, and {{yandex}}Yandex.Webmaster{{/yandex}}.',
								{
									components: {
										b: <strong />,
										support: <a href="https://en.support.wordpress.com/webmaster-tools/" />,
										google: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="https://www.google.com/webmasters/tools/"
											/>
										),
										bing: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="https://www.bing.com/webmaster/"
											/>
										),
										pinterest: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="https://pinterest.com/website/verify/"
											/>
										),
										yandex: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="https://webmaster.yandex.com/sites/"
											/>
										),
									}
								}
							) }
						</p>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Google' ) }
								name="verification_code_google"
								type="text"
								value={ googleCode }
								id="verification_code_google"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ hasError( 'google' ) }
								placeholder={ getMetaTag( 'google', placeholderTagContent ) }
								onChange={ this.changeGoogleCode } />
							{ hasError( 'google' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Bing' ) }
								name="verification_code_bing"
								type="text"
								value={ bingCode }
								id="verification_code_bing"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ hasError( 'bing' ) }
								placeholder={ getMetaTag( 'bing', placeholderTagContent ) }
								onChange={ this.changeBingCode } />
							{ hasError( 'bing' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Pinterest' ) }
								name="verification_code_pinterest"
								type="text"
								value={ pinterestCode }
								id="verification_code_pinterest"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ hasError( 'pinterest' ) }
								placeholder={ getMetaTag( 'pinterest', placeholderTagContent ) }
								onChange={ this.changePinterestCode } />
							{ hasError( 'pinterest' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Yandex' ) }
								name="verification_code_yandex"
								type="text"
								value={ yandexCode }
								id="verification_code_yandex"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ hasError( 'yandex' ) }
								placeholder={ getMetaTag( 'yandex', placeholderTagContent ) }
								onChange={ this.changeYandexCode } />
							{ hasError( 'yandex' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
					</Card>
				</form>
				<WebPreview
					showPreview={ showPreview }
					onClose={ this.hidePreview }
					previewUrl={ siteUrl }
					showDeviceSwitcher={ false }
					showExternal={ false }
					defaultViewportDevice="seo"
				/>
			</div>
		);
		/* eslint-enable react/jsx-no-target-blank */
	}
} );

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
		isVerificationToolsActive: isJetpackModuleActive( state, siteId, 'verification-tools' ),
		activePlugins: getPlugins( state, [ { ID: siteId } ], 'active' ),
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
