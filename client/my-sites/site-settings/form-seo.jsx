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
import protectForm from 'lib/mixins/protect-form';
import FormInput from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CountedTextarea from 'components/forms/counted-textarea';
import SeoSettingsUpgradeNudge from 'components/seo/settings-upgrade-nudge';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import config from 'config';
import { getSeoTitleFormatsForSite } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import { recordTracksEvent } from 'state/analytics/actions';
import SearchPreview from 'components/seo/search-preview';
import WebPreview from 'components/web-preview';
import { requestSite } from 'state/sites/actions';
import { isBusiness, isEnterprise } from 'lib/products-values';

const serviceIds = {
	google: 'google-site-verification',
	bing: 'msvalidate.01',
	pinterest: 'p:domain_verify',
	yandex: 'yandex-verification'
};

// Basic matching for HTML tags
// Not perfect but meets the needs of this component well
const anyHtmlTag = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

const hasBusinessPlan = overSome( isBusiness, isEnterprise );

function getGeneralTabUrl( slug ) {
	return `/settings/general/${ slug }`;
}

function stateForSite( site ) {
	return {
		seoMetaDescription: get( site, 'options.seo_meta_description', '' ),
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

	mixins: [ protectForm.mixin ],

	getInitialState() {
		return {
			...stateForSite( this.props.site ),
			seoTitleFormats: {},
			isRefreshingSiteData: false,
			dirtyFields: Set()
		};
	},

	componentDidMount() {
		this.refreshCustomTitles();
	},

	componentWillReceiveProps( nextProps ) {
		const { dirtyFields } = this.state;

		let nextState = {
			...stateForSite( nextProps.site ),
			seoTitleFormats: nextProps.storedTitleFormats
		};

		// Don't update state for fields the user has edited
		nextState = omit( nextState, dirtyFields.toArray() );

		const wasRefreshingSiteData = this.state.isRefreshingSiteData;
		const isRefreshingSiteData = (
			this.state.isSubmittingForm ||
			(
				wasRefreshingSiteData &&
				isEqual( this.props.storedTitleFormats, nextProps.storedTitleFormats )
			)
		);

		if ( isRefreshingSiteData ) {
			nextState = omit( nextState, [ 'seoTitleFormats' ] );
		}

		this.setState( {
			...nextState,
			isRefreshingSiteData
		} );
	},

	handleMetaChange( { target: { value: seoMetaDescription } } ) {
		const { dirtyFields } = this.state;

		// Don't allow html tags in the input field
		const hasHtmlTagError = anyHtmlTag.test( seoMetaDescription );

		this.setState( Object.assign(
			{ hasHtmlTagError },
			! hasHtmlTagError && { seoMetaDescription },
			{ dirtyFields: dirtyFields.add( 'seoMetaDescription' ) }
		) );
	},

	handleVerificationCodeChange( event, serviceCode ) {
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
			trackSubmission
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
			seo_meta_description: this.state.seoMetaDescription,
			verification_services_codes: filteredCodes
		};

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
				this.markSaved();
				this.setState( { isSubmittingForm: false } );

				site.fetchSettings();
				this.refreshCustomTitles();
			}
		} );

		trackSubmission();
	},

	refreshCustomTitles() {
		const {
			refreshSiteData,
			selectedSite
		} = this.props;

		if ( selectedSite && selectedSite.ID ) {
			refreshSiteData( selectedSite.ID );
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
		const { showAdvancedSeo, showUpgradeNudge, upgradeToBusiness } = this.props;
		const {
			description: siteDescription,
			slug = '',
			settings: {
				blog_public = 1
			} = {},
			title: siteTitle
		} = this.props.site;

		const {
			isSubmittingForm,
			isFetchingSettings,
			seoMetaDescription,
			showPasteError = false,
			hasHtmlTagError = false,
			invalidCodes = [],
			showPreview = false
		} = this.state;

		let { googleCode, bingCode, pinterestCode, yandexCode } = this.state;

		const isSitePrivate = parseInt( blog_public, 10 ) !== 1;
		const isDisabled = isSitePrivate || isSubmittingForm || isFetchingSettings;
		const isSaveDisabled = isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const seoTitle = siteDescription.length
			? `${ siteTitle } | ${ siteDescription }`
			: siteTitle;
		const siteUrl = `https://${ slug }/`;
		const sitemapUrl = `${ siteUrl }sitemap.xml`;
		const generalTabUrl = getGeneralTabUrl( slug );
		const placeholderTagContent = '1234';

		// The API returns 'false' for an empty array value, so we force it to an empty string if needed
		googleCode = getMetaTag( 'google', googleCode || '' );
		bingCode = getMetaTag( 'bing', bingCode || '' );
		pinterestCode = getMetaTag( 'pinterest', pinterestCode || '' );
		yandexCode = getMetaTag( 'yandex', yandexCode || '' );

		const hasError = function( service ) {
			return includes( invalidCodes, service );
		};

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

		let preview = (
			<SearchPreview
				title={ seoTitle }
				url={ siteUrl }
				snippet={ seoMetaDescription }
			/>
		);

		if ( config.isEnabled('manage/advanced-seo') ) {
			preview = (
				<FormSettingExplanation>
					<Button className="preview-button" onClick={ this.showPreview }>
						{ this.translate('Show Previews') }
					</Button>
					<span className="preview-explanation">
						{ this.translate('See how this will look on Google, Facebook, and Twitter.') }
					</span>
				</FormSettingExplanation>
			);
		}

		return (
			<div>
				<PageViewTracker path="/settings/seo/:site" title="Site Settings > SEO" />
				{ isSitePrivate &&
					<Notice status="is-warning" showDismiss={ false } text={ this.translate( 'SEO settings are disabled because the site visibility is not set to Public.' ) }>
						<NoticeAction href={ generalTabUrl }>{ this.translate( 'View Settings' ) }</NoticeAction>
					</Notice>
				}

				{ showUpgradeNudge && <SeoSettingsUpgradeNudge { ...{ upgradeToBusiness } } /> }

				<SectionHeader label={ this.translate( 'Search Engine Optimization' ) }>
				</SectionHeader>
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

				<form onChange={ this.markChanged } className="seo-form">
					{ showAdvancedSeo && config.isEnabled( 'manage/advanced-seo/custom-title' ) &&
						<div>
							<SectionHeader label={ this.translate( 'Page Title Structure' ) }>
								{ submitButton }
							</SectionHeader>
							<Card>
								<p>
								{ this.translate(
									'You can set the structure of page titles for different sections of your site. ' +
									'Doing this will change the way your site title is displayed in search engine ' +
									'results, and when shared on social media sites.'
								) }
								</p>
								<MetaTitleEditor onChange={ this.updateTitleFormats } />
							</Card>
						</div>
					}

					{ showAdvancedSeo &&
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
									<FormLabel htmlFor="seo_meta_description">
										{ this.translate( 'Front Page Meta Description' ) }
									</FormLabel>
									<CountedTextarea
										name="seo_meta_description"
										type="text"
										id="seo_meta_description"
										value={ seoMetaDescription || '' }
										disabled={ isDisabled }
										maxLength="300"
										acceptableLength={ 159 }
										onChange={ this.handleMetaChange }
									/>
									{ hasHtmlTagError &&
										<FormInputValidation isError={ true } text={ this.translate( 'HTML tags are not allowed.' ) } />
									}
								</p>
								{ preview }
							</Card>
						</div>
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
										google: <ExternalLink icon={ true } target="_blank" href="https://www.google.com/webmasters/tools/" />,
										bing: <ExternalLink icon={ true } target="_blank" href="https://www.bing.com/webmaster/" />,
										pinterest: <ExternalLink icon={ true } target="_blank" href="https://pinterest.com/website/verify/" />,
										yandex: <ExternalLink icon={ true } target="_blank" href="https://webmaster.yandex.com/sites/" />
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
								onChange={ event => this.handleVerificationCodeChange( event, 'googleCode' ) } />
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
								onChange={ event => this.handleVerificationCodeChange( event, 'bingCode' ) } />
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
								onChange={ event => this.handleVerificationCodeChange( event, 'pinterestCode' ) } />
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
								onChange={ event => this.handleVerificationCodeChange( event, 'yandexCode' ) } />
							{ hasError( 'yandex' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="seo_sitemap">{ this.translate( 'XML Sitemap' ) }</FormLabel>
							<ExternalLink className="seo-sitemap" icon={ true } href={ sitemapUrl } target="_blank">{ sitemapUrl }</ExternalLink>
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
	}
} );

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;
	const isAdvancedSeoEligible = site && site.plan && hasBusinessPlan( site.plan );

	return {
		selectedSite: getSelectedSite( state ),
		storedTitleFormats: getSeoTitleFormatsForSite( getSelectedSite( state ) ),
		showAdvancedSeo: isAdvancedSeoEligible && config.isEnabled( 'manage/advanced-seo' ),
		showUpgradeNudge: ! isAdvancedSeoEligible && config.isEnabled( 'manage/advanced-seo' )
	};
};

const mapDispatchToProps = {
	refreshSiteData: siteId => requestSite( siteId ),
	trackSubmission: () => recordTracksEvent( 'calypso_seo_settings_form_submit', {} )
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( SeoForm );
