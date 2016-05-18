/**
 * External dependencies
 */
import React from 'react';
import get from 'lodash/get';
import omitBy from 'lodash/omitBy';
import isBoolean from 'lodash/isBoolean';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import ExternalLink from 'components/external-link';
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
import analytics from 'lib/analytics';
import PageViewTracker from 'lib/analytics/page-view-tracker';

function getGeneralSettingsUrl( slug ) {
	return `/settings/general/${ slug }`;
}

function stateForSite( site ) {
	return {
		seoMetaDescription: get( site, 'options.seo_meta_description', '' ),
		verificationServicesCodes: {
			google: get( site, 'options.verification_services_codes.google', '' ),
			bing: get( site, 'options.verification_services_codes.bing', '' ),
			pinterest: get( site, 'options.verification_services_codes.pinterest', '' ),
			yandex: get( site, 'options.verification_services_codes.yandex', '' )
		}
	};
}

export default React.createClass( {
	displayName: 'SiteSettingsFormSEO',

	mixins: [ protectForm.mixin ],

	getInitialState() {
		return stateForSite( this.props.site );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( get( nextProps, 'site.ID' ) !== get( this.props, 'site.ID' ) ) {
			if ( get( nextProps, 'site.jetpack' ) ) {
				// Go back to general settings if switched to a Jetpack site
				page( getGeneralSettingsUrl( get( nextProps, 'site.slug', '' ) ) );
				return;
			}

			// Update state when switching sites
			this.setState( stateForSite( nextProps.site ) );
		}
	},

	handleMetaChange( event ) {
		this.setState( { seoMetaDescription: get( event, 'target.value', '' ) } );
	},

	handleVerificationCodeChange( event, serviceName ) {
		const servicesCodes = this.state.verificationServicesCodes;
		if ( ! servicesCodes.hasOwnProperty( serviceName ) ) {
			return;
		}

		this.setState( {
			verificationServicesCodes: Object.assign( {}, servicesCodes, {
				[ serviceName ]: event.target.value
			} )
		} );
	},

	submitSeoForm( event ) {
		const site = this.props.site;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		this.setState( { isSubmittingForm: true } );

		const filteredCodes = omitBy( this.state.verificationServicesCodes, isBoolean );
		const updatedOptions = {
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

		analytics.tracks.recordEvent( 'calypso_seo_settings_form_submit' );
	},

	render() {
		const { slug = '', settings: { blog_public = 1 } = {}, fetchingSettings } = this.props.site;
		const { isSubmittingForm, seoMetaDescription, verificationServicesCodes } = this.state;

		const isSitePrivate = parseInt( blog_public, 10 ) !== 1;
		const isDisabled = isSitePrivate || fetchingSettings || isSubmittingForm;
		const hasMetaError = seoMetaDescription && seoMetaDescription.length > 160;

		const sitemapUrl = `https://${ slug }/sitemap.xml`;
		const generalSettingsUrl = getGeneralSettingsUrl( slug );

		// The API returns 'false' for an empty array value, so we force it to an empty string if needed
		const googleCode = get( verificationServicesCodes, 'google' ) || '';
		const bingCode = get( verificationServicesCodes, 'bing' ) || '';
		const pinterestCode = get( verificationServicesCodes, 'pinterest' ) || '';
		const yandexCode = get( verificationServicesCodes, 'yandex' ) || '';

		return (
			<div className={ fetchingSettings ? 'is-loading' : '' }>
				<PageViewTracker path="/settings/seo/:site" title="Site Settings > SEO" />
				{ isSitePrivate &&
					<Notice status="is-warning" showDismiss={ false } text={ this.translate( 'SEO settings are disabled because the site visibility is not set to Public.' ) }>
						<NoticeAction href={ generalSettingsUrl }>{ this.translate( 'View Settings' ) }</NoticeAction>
					</Notice>
				}
				<SectionHeader label={ this.translate( 'Search Engine Optimization' ) }>
					<Button
						compact={ true }
						onClick={ this.submitSeoForm }
						primary={ true }
						type="submit"
						disabled={ isDisabled || isSubmittingForm }
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
							<FormFieldset className="has-divider is-top-only">
								<FormLabel htmlFor="seo_meta_description">{ this.translate( 'Front Page Meta Description' ) }</FormLabel>
								<CountedTextarea
									name="seo_meta_description"
									type="text"
									id="seo_meta_description"
									value={ seoMetaDescription || '' }
									disabled={ isDisabled }
									maxLength="160"
									acceptableLength={ 159 }
									onChange={ this.handleMetaChange } />
								{ hasMetaError &&
									<FormInputValidation isError={ true } text={ this.translate( 'Description can\'t be longer than 160 characters.' ) } />
								}
								<FormSettingExplanation>
									{ this.translate( 'Craft a description of your site in 160 characters or less. This description can be used in search engine results for your site\'s Front Page.' ) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset className="has-divider">
								<FormLabel htmlFor="seo_sitemap">{ this.translate( 'XML Sitemap' ) }</FormLabel>
								<ExternalLink className="seo-sitemap" icon={ true } href={ sitemapUrl } target={ "_blank" }>{ sitemapUrl }</ExternalLink>
								<FormSettingExplanation>
									{ this.translate( 'Your site\'s sitemap is automatically sent to all major search engines for indexing.' ) }
								</FormSettingExplanation>
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
													google: <ExternalLink icon={ true } href="https://www.google.com/webmasters/tools/" />,
													bing: <ExternalLink icon={ true } href="https://www.bing.com/webmaster/" />,
													pinterest: <ExternalLink icon={ true } href="https://pinterest.com/website/verify/" />,
													yandex: <ExternalLink icon={ true } href="https://webmaster.yandex.com/sites/" />
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
									disabled={ isDisabled }
									placeholder={ '<meta name="google-site-verification" content="1234">' }
									onChange={ event => this.handleVerificationCodeChange( event, 'google' ) } />
							</FormFieldset>

							<FormFieldset>
								<FormInput
									prefix={ this.translate( 'Bing' ) }
									name="verification_code_bing"
									type="text"
									value={ bingCode }
									id="verification_code_bing"
									disabled={ isDisabled }
									placeholder={ '<meta name="msvalidate.01" content="1234" />' }
									onChange={ event => this.handleVerificationCodeChange( event, 'bing' ) } />
							</FormFieldset>

							<FormFieldset>
								<FormInput
									prefix={ this.translate( 'Pinterest' ) }
									name="verification_code_pinterest"
									type="text"
									value={ pinterestCode }
									id="verification_code_pinterest"
									disabled={ isDisabled }
									placeholder={ '<meta name="p:domain_verify content="1234" />' }
									onChange={ event => this.handleVerificationCodeChange( event, 'pinterest' ) } />
							</FormFieldset>

							<FormFieldset>
								<FormInput
									prefix={ this.translate( 'Yandex' ) }
									name="verification_code_yandex"
									type="text"
									value={ yandexCode }
									id="verification_code_yandex"
									disabled={ isDisabled }
									placeholder={ '<meta name="yandex-verification" content="1234" />' }
									onChange={ event => this.handleVerificationCodeChange( event, 'yandex' ) } />
							</FormFieldset>

						</FormFieldset>
					</form>
				</Card>
			</div>
		);
	}
} );
