/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import {
	get,
	includes,
	isEqual,
	isString,
	omit,
	overSome,
	pickBy
} from 'lodash';

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
import UpgradeNudge from 'my-sites/upgrade-nudge';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSeoTitleFormatsForSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import { recordTracksEvent } from 'state/analytics/actions';
import WebPreview from 'components/web-preview';
import { requestSite } from 'state/sites/actions';
import {
	isBusiness,
	isEnterprise,
	isJetpackBusiness
} from 'lib/products-values';
import { FEATURE_ADVANCED_SEO } from 'lib/plans/constants';

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
			isRefreshingSiteData: true,
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
		const { selectedSite: prevSite } = this.props;
		const { selectedSite: nextSite } = nextProps;
		const { dirtyFields } = this.state;

		// if we are changing sites, everything goes
		if ( prevSite.ID !== nextSite.ID ) {
			return this.setState( {
				...stateForSite( nextSite ),
				seoTitleFormats: nextProps.storedTitleFormats,
				invalidatedSiteObject: nextSite,
				isRefreshingSiteData: true,
				dirtyFields: Set(),
			}, this.refreshCustomTitles );
		}

		let nextState = {
			...stateForSite( nextProps.site ),
			seoTitleFormats: nextProps.storedTitleFormats,
		};

		const isRefreshingSiteData = (
			this.state.isRefreshingSiteData &&
			( this.state.invalidatedSiteObject === nextProps.selectedSite )
		);

		if ( this.state.isRefreshingSiteData && ! isRefreshingSiteData ) {
			nextState = {
				...nextState,
				seoTitleFormats: nextProps.storedTitleFormats,
				dirtyFields: dirtyFields.delete( 'seoTitleFormats' ),
			};
		}

		if ( isRefreshingSiteData ) {
			nextState = omit( nextState, [ 'seoTitleFormats' ] );
		}

		// Don't update state for fields the user has edited
		nextState = omit( nextState, dirtyFields.toArray() );

		this.setState( {
			...nextState,
			isRefreshingSiteData,
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
			site,
			storedTitleFormats,
			showAdvancedSeo,
			showWebsiteMeta
		} = this.props;

		const { dirtyFields } = this.state;

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
			notices.error( this.translate( 'Invalid site verification tag entered.' ) );
			return;
		}

		this.setState( {
			isSubmittingForm: true,
			isRefreshingSiteData: dirtyFields.has( 'seoTitleFormats' ),
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

		site.saveSettings( updatedOptions, error => {
			if ( error ) {
				switch ( error.error ) {
					case 'invalid_ip':
						notices.error( this.translate( 'One of your IP Addresses was invalid. Please, try again.' ) );
						break;
					default:
						notices.error( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
				}
				this.setState( { isSubmittingForm: false } );
			} else {
				notices.success( this.translate( 'Settings saved!' ) );
				this.props.markSaved();
				this.setState( { isSubmittingForm: false } );

				site.fetchSettings();
				this.refreshCustomTitles();
			}
		} );

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
				isRefreshingSiteData: true,
				invalidatedSiteObject: selectedSite,
			}, () => refreshSiteData( selectedSite.ID ) );
		}
	},

	getVerificationError( isPasteError ) {
		return (
			<FormInputValidation isError={ true } text={
				isPasteError
					? this.translate( 'Verification code should be copied and pasted into this field.' )
					: this.translate( 'Invalid site verification tag.' )
			} />
		);
	},

	showPreview() {
		this.setState( { showPreview: true } );
	},

	hidePreview() {
		this.setState( { showPreview: false } );
	},

	render() {
		const { showAdvancedSeo,
			showWebsiteMeta,
			jetpackVersionSupportsSeo,
		} = this.props;
		const {
			domain = '',
			slug = '',
			settings: {
				blog_public = 1
			} = {},
			jetpack = false,
		} = this.props.site;

		const {
			isSubmittingForm,
			isFetchingSettings,
			isRefreshingSiteData,
			frontPageMetaDescription,
			showPasteError = false,
			hasHtmlTagError = false,
			invalidCodes = [],
			showPreview = false
		} = this.state;

		let { googleCode, bingCode, pinterestCode, yandexCode } = this.state;

		const isSitePrivate = parseInt( blog_public, 10 ) !== 1;
		const isJetpackUnsupported = jetpack && ! jetpackVersionSupportsSeo;
		const isDisabled = isSitePrivate || isJetpackUnsupported || isSubmittingForm || isFetchingSettings;
		const isSaveDisabled = isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const siteUrl = `https://${ domain }/`;
		const sitemapUrl = `${ siteUrl }sitemap.xml`;
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

		const nudgeTitle = jetpack
			? this.translate( 'Enable SEO Tools Features by Upgrading to Jetpack Professional' )
			: this.translate( 'Enable SEO Tools Features by Upgrading to the Business Plan' );

		const submitButton = (
			<Button
				compact={ true }
				onClick={ this.submitSeoForm }
				primary={ true }
				type="submit"
				disabled={ isSaveDisabled }
			>
				{ isSubmittingForm
					? this.translate( 'Saving…' )
					: this.translate( 'Save Settings' )
				}
			</Button>
		);

		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div>
				<PageViewTracker
					path="/settings/seo/:site"
					title="Site Settings > SEO"
				/>
				{ isSitePrivate &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ this.translate(
							'SEO settings are disabled because the ' +
							'site visibility is not set to Public.'
						) }
					>
						<NoticeAction href={ generalTabUrl }>
							{ this.translate( 'View Settings' ) }
						</NoticeAction>
					</Notice>
				}

				{ isJetpackUnsupported &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ this.translate(
							'SEO Tools require a newer version of Jetpack.'
						) }
					>
						<NoticeAction href={ jetpackUpdateUrl }>
							{ this.translate( 'Update Now' ) }
						</NoticeAction>
					</Notice>
				}

				{ jetpack && ! this.props.site.isModuleActive( 'seo-tools' ) &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ this.translate(
							'SEO Tools module is disabled in Jetpack.'
						) }
					>
						<NoticeAction href={ '//' + domain + '/wp-admin/admin.php?page=jetpack#/engagement' }>
							{ this.translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				}

				<UpgradeNudge
					feature={ FEATURE_ADVANCED_SEO }
					title={ nudgeTitle }
					message={ this.translate( 'Adds tools to optimize your site for search engines and social media sharing.' ) }
					event={ 'calypso_seo_settings_upgrade_nudge' }
					jetpack={ jetpack }
				/>

				{ ! jetpack &&
					<div>
						<SectionHeader label={ this.translate( 'Search Engine Optimization' ) } />
						<Card>
							{ this.translate(
								'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized ' +
								'for search engines, so you don\'t have to do anything extra. However, you can tweak ' +
								'these settings if you\'d like more advanced control. Read more about what you can do ' +
								'to {{a}}optimize your site\'s SEO{{/a}}.',
								{
									components: {
										a: <a href={ 'https://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/' } />,
										b: <strong />
									}
								}
							) }
						</Card>
					</div>
				}

				<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
					{ showAdvancedSeo &&
						<div>
							<SectionHeader label={ this.translate( 'Page Title Structure' ) }>
								{ submitButton }
							</SectionHeader>
							<Card compact="true" className="seo-settings__page-title__header">
								<img className="seo-settings__page-title__header-image" src="/calypso/images/seo/page-title.svg" />
								<p className="seo-settings__page-title__header-text">
								{ this.translate(
									'You can set the structure of page titles for different sections of your site. ' +
									'Doing this will change the way your site title is displayed in search engines, ' +
									'social media sites, and browser tabs.'
								) }
								</p>
							</Card>
							<Card>
								<MetaTitleEditor
									disabled={ isRefreshingSiteData || isDisabled }
									onChange={ this.updateTitleFormats }
									titleFormats={ this.state.seoTitleFormats }
								/>
							</Card>
						</div>
					}

					{ ( showAdvancedSeo || ( ! jetpack && showWebsiteMeta ) ) &&
						<div>
							<SectionHeader label={ this.translate( 'Website Meta' ) }>
								{ submitButton }
							</SectionHeader>
							<Card>
								<p>
									{ this.translate(
										'Craft a description of your Website up to 160 characters that will be used in ' +
										'search engine results for your front page, and when your website is shared ' +
										'on social media sites.'
									) }
								</p>
								<p>
									<FormLabel htmlFor="advanced_seo_front_page_description">
										{ this.translate( 'Front Page Meta Description' ) }
									</FormLabel>
									<CountedTextarea
										name="advanced_seo_front_page_description"
										type="text"
										id="advanced_seo_front_page_description"
										value={ frontPageMetaDescription || '' }
										disabled={ isDisabled }
										maxLength="300"
										acceptableLength={ 159 }
										onChange={ this.handleMetaChange }
									/>
									{ hasHtmlTagError &&
										<FormInputValidation isError={ true } text={ this.translate( 'HTML tags are not allowed.' ) } />
									}
								</p>
								<FormSettingExplanation>
									<Button
										className="seo-settings__preview-button"
										onClick={ this.showPreview }
									>
										{ this.translate( 'Show Previews' ) }
									</Button>
									<span className="seo-settings__preview-explanation">
										{ this.translate(
											'See how this will look on ' +
											'Google, Facebook, and Twitter.'
										) }
									</span>
								</FormSettingExplanation>
							</Card>
						</div>
					}

					{ jetpack && ! this.props.site.isModuleActive( 'verification-tools' ) &&
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ this.translate(
								'Site Verification Services are disabled in Jetpack.'
							) }
						>
							<NoticeAction href={ '//' + domain + '/wp-admin/admin.php?page=jetpack#/engagement' }>
								{ this.translate( 'Enable' ) }
							</NoticeAction>
						</Notice>
					}

					<SectionHeader label={ this.translate( 'Site Verification Services' ) }>
						{ submitButton }
					</SectionHeader>
					<Card>
						<p>
							{ this.translate(
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
								prefix={ this.translate( 'Google' ) }
								name="verification_code_google"
								type="text"
								value={ googleCode }
								id="verification_code_google"
								spellCheck="false"
								disabled={ isDisabled }
								isError={ hasError( 'google' ) }
								placeholder={ getMetaTag( 'google', placeholderTagContent ) }
								onChange={ this.changeGoogleCode } />
							{ hasError( 'google' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ this.translate( 'Bing' ) }
								name="verification_code_bing"
								type="text"
								value={ bingCode }
								id="verification_code_bing"
								spellCheck="false"
								disabled={ isDisabled }
								isError={ hasError( 'bing' ) }
								placeholder={ getMetaTag( 'bing', placeholderTagContent ) }
								onChange={ this.changeBingCode } />
							{ hasError( 'bing' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ this.translate( 'Pinterest' ) }
								name="verification_code_pinterest"
								type="text"
								value={ pinterestCode }
								id="verification_code_pinterest"
								spellCheck="false"
								disabled={ isDisabled }
								isError={ hasError( 'pinterest' ) }
								placeholder={ getMetaTag( 'pinterest', placeholderTagContent ) }
								onChange={ this.changePinterestCode } />
							{ hasError( 'pinterest' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ this.translate( 'Yandex' ) }
								name="verification_code_yandex"
								type="text"
								value={ yandexCode }
								id="verification_code_yandex"
								spellCheck="false"
								disabled={ isDisabled }
								isError={ hasError( 'yandex' ) }
								placeholder={ getMetaTag( 'yandex', placeholderTagContent ) }
								onChange={ this.changeYandexCode } />
							{ hasError( 'yandex' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="seo_sitemap">{ this.translate( 'XML Sitemap' ) }</FormLabel>
							<ExternalLink
								className="seo-settings__seo-sitemap"
								icon={ true }
								href={ sitemapUrl }
								target="_blank"
							>
								{ sitemapUrl }
							</ExternalLink>
							<FormSettingExplanation>
								{ this.translate( 'Your site\'s sitemap is automatically sent to all major search engines for indexing.' ) }
							</FormSettingExplanation>
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
	const siteId = get( site, 'ID', 0 );
	const jetpackVersionSupportsSeo = isJetpackMinimumVersion( state, siteId, '4.4-beta1' );
	const isAdvancedSeoSupported = site && ( ! site.jetpack || ( site.jetpack && jetpackVersionSupportsSeo ) );

	return {
		selectedSite: getSelectedSite( state ),
		storedTitleFormats: getSeoTitleFormatsForSite( getSelectedSite( state ) ),
		showAdvancedSeo: isAdvancedSeoEligible && isAdvancedSeoSupported,
		showWebsiteMeta: !! get( site, 'options.advanced_seo_front_page_description', '' ),
		jetpackVersionSupportsSeo: jetpackVersionSupportsSeo,
	};
};

const mapDispatchToProps = dispatch => ( {
	refreshSiteData: siteId => dispatch( requestSite( siteId ) ),
	trackFormSubmitted: () => dispatch( recordTracksEvent( 'calypso_seo_settings_form_submit', {} ) ),
	trackTitleFormatsUpdated: () => dispatch( recordTracksEvent( 'calypso_seo_tools_title_formats_updated', {} ) ),
	trackFrontPageMetaUpdated: () => dispatch( recordTracksEvent( 'calypso_seo_tools_front_page_meta_updated', {} ) )
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( protectForm( SeoForm ) );
