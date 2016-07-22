/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import {
	get,
	includes,
	isEqual,
	isString,
	omit,
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
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SearchPreview from 'components/seo/search-preview';
import config from 'config';
import { getSeoTitleFormatsForSite } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { toApi as seoTitleToApi } from 'components/seo/meta-title-editor/mappings';
import { recordTracksEvent } from 'state/analytics/actions';

const serviceIds = {
	google: 'google-site-verification',
	bing: 'msvalidate.01',
	pinterest: 'p:domain_verify',
	yandex: 'yandex-verification'
};

// Basic matching for HTML tags
// Not perfect but meets the needs of this component well
const anyHtmlTag = /<\/?[a-z][a-z0-9]*\b[^>]*>/i;

function getGeneralTabUrl( slug ) {
	return `/settings/general/${ slug }`;
}

function stateForSite( site ) {
	return {
		seoMetaDescription: get( site, 'options.seo_meta_description', '' ),
		seoTitleFormats: getSeoTitleFormatsForSite( site ),
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
		return stateForSite( this.props.site );
	},

	componentWillReceiveProps( nextProps ) {
		let nextState = stateForSite( nextProps.site );

		// Don't update state for fields the user has edited
		if ( this.state.dirtyFields ) {
			nextState = omit( nextState, this.state.dirtyFields );
		}

		this.setState( nextState );
	},

	handleMetaChange( event ) {
		const seoMetaDescription = event.target.value;
		// Don't allow html tags in the input field
		const hasHtmlTagError = anyHtmlTag.test( seoMetaDescription );

		const { dirtyFields = [] } = this.state;
		if ( ! includes( dirtyFields, 'seoMetaDescription' ) ) {
			dirtyFields.push( 'seoMetaDescription' );
		}

		this.setState( Object.assign(
			{ hasHtmlTagError },
			! hasHtmlTagError && { seoMetaDescription },
			{ dirtyFields }
		) );
	},

	handleVerificationCodeChange( event, serviceCode ) {
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

		const { dirtyFields = [] } = this.state;
		if ( ! includes( dirtyFields, serviceCode ) ) {
			dirtyFields.push( serviceCode );
		}

		this.setState( {
			invalidCodes: [],
			showPasteError: false,
			[ serviceCode ]: event.target.value,
			dirtyFields
		} );
	},

	/**
	 * Tracks updates to the title formats
	 *
	 * We need to be careful here and only
	 * send _changes_ to the API instead of
	 * sending all of the title formats.
	 * There is a race condition here after
	 * sending the changes and before updating
	 * from the SitesList wherein we could
	 * accidentally overwrite new changes.
	 *
	 * @param {object} seoTitleFormats SEO title formats e.g. { frontPage: '%site_name%' }
	 */
	updateTitleFormats( seoTitleFormats ) {
		const { storedTitleFormats } = this.props;

		const hasChanges = ( format, type ) =>
			! isEqual( format, storedTitleFormats[ type ] );

		this.setState( {
			seoTitleFormats: pickBy( seoTitleFormats, hasChanges )
		} );
	},

	submitSeoForm( event ) {
		const { site, trackSubmission } = this.props;

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

		this.setState( { isSubmittingForm: true } );

		const updatedOptions = {
			advanced_seo_title_formats: seoTitleToApi( this.state.seoTitleFormats ),
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
			}
		} );

		trackSubmission();
	},

	render() {
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
			invalidCodes = []
		} = this.state;

		let { googleCode, bingCode, pinterestCode, yandexCode } = this.state;

		const isSitePrivate = parseInt( blog_public, 10 ) !== 1;
		const isDisabled = isSitePrivate || isSubmittingForm || isFetchingSettings;
		const isSaveDisabled = isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );

		const seoTitle = siteDescription.length
			? `${ siteTitle } | ${ siteDescription }`
			: siteTitle;
		const siteUrl = `https://${ slug }/`;
		const sitemapUrl = `${ siteUrl }/sitemap.xml`;
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

		return (
			<div>
				<PageViewTracker path="/settings/seo/:site" title="Site Settings > SEO" />
				{ isSitePrivate &&
					<Notice status="is-warning" showDismiss={ false } text={ this.translate( 'SEO settings are disabled because the site visibility is not set to Public.' ) }>
						<NoticeAction href={ generalTabUrl }>{ this.translate( 'View Settings' ) }</NoticeAction>
					</Notice>
				}
				<SectionHeader label={ this.translate( 'Search Engine Optimization' ) }>
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
				</SectionHeader>
				<Card>
					<p>
						{ this.translate(
							'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized for search engines, ' +
							'so you don\'t have to do anything extra. However, you can tweak these settings if you\'d like more advanced control. ' +
							'Read more about what you can do to {{a}}optimize your site\'s SEO{{/a}}.',
							{
								components: {
									a: <a href={ 'https://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/' } />,
									b: <strong />
								}
							}
						) }
					</p>
					<form onChange={ this.markChanged } className="seo-form">
						<FormFieldset>
							<FormFieldset className="has-divider">
								{ config.isEnabled( 'manage/advanced-seo/custom-title' ) &&
									<div>
										<FormLabel htmlFor="seo_title">{ this.translate( 'Meta Title Format' ) }</FormLabel>
										<MetaTitleEditor onChange={ this.updateTitleFormats } />
										<FormSettingExplanation>
											{ this.translate( 'Customize how the title for your content will appear in search engines and social media.' ) }
										</FormSettingExplanation>
									</div>
								}

								<FormLabel htmlFor="seo_meta_description">{ this.translate( 'Front Page Meta Description' ) }</FormLabel>
								<CountedTextarea
									name="seo_meta_description"
									type="text"
									id="seo_meta_description"
									value={ seoMetaDescription || '' }
									disabled={ isDisabled }
									maxLength="300"
									acceptableLength={ 159 }
									onChange={ this.handleMetaChange } />
								{ hasHtmlTagError &&
									<FormInputValidation isError={ true } text={ this.translate( 'HTML tags are not allowed.' ) } />
								}
								<FormSettingExplanation>
									{ this.translate( 'Craft a description of your site in about 160 characters. This description can be used in search engine results for your site\'s Front Page.' ) }
								</FormSettingExplanation>

								<SearchPreview
									title={ seoTitle }
									url={ siteUrl }
									snippet={ seoMetaDescription }
								/>
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="verification_code_google">{ this.translate( 'Site Verification Services' ) }</FormLabel>
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
						</FormFieldset>

						<FormFieldset className="has-divider is-top-only">
								<FormLabel htmlFor="seo_sitemap">{ this.translate( 'XML Sitemap' ) }</FormLabel>
								<ExternalLink className="seo-sitemap" icon={ true } href={ sitemapUrl } target="_blank">{ sitemapUrl }</ExternalLink>
								<FormSettingExplanation>
									{ this.translate( 'Your site\'s sitemap is automatically sent to all major search engines for indexing.' ) }
								</FormSettingExplanation>
						</FormFieldset>
					</form>
				</Card>
			</div>
		);
	},

	getVerificationError( isPasteError ) {
		return (
			<FormInputValidation isError={ true } text={
				isPasteError
					? this.translate( 'Verification code should be copied and pasted into this field.' )
					: this.translate( 'Invalid site verification tag.' )
			} />
		);
	}
} );

const mapStateToProps = state => ( {
	storedTitleFormats: getSeoTitleFormatsForSite( getSelectedSite( state ) )
} );

const mapDispatchToProps = {
	trackSubmission: () => recordTracksEvent( 'calypso_seo_settings_form_submit', {} )
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( SeoForm );
