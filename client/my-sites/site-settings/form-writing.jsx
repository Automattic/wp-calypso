/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import config from 'config';
import PressThis from './press-this';
import FormSelect from 'components/forms/form-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import FormLabel from 'components/forms/form-label';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import QueryTaxonomies from 'components/data/query-taxonomies';
import TaxonomyCard from './taxonomies/taxonomy-card';
import {
	isJetpackModuleActive,
	isJetpackMinimumVersion,
	isJetpackSite,
	siteSupportsJetpackSettingsUi
} from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestPostTypes } from 'state/post-types/actions';
import CustomPostTypeFieldset from './custom-post-types-fieldset';
import ThemeEnhancements from './theme-enhancements';
import PublishingTools from './publishing-tools';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

class SiteSettingsFormWriting extends Component {

	isCustomPostTypesSettingsEnabled() {
		return (
			config.isEnabled( 'manage/custom-post-types' ) &&
			this.props.jetpackVersionSupportsCustomTypes
		);
	}

	onSaveComplete() {
		if ( this.isCustomPostTypesSettingsEnabled() ) {
			this.props.requestPostTypes( this.props.site.ID );
		}
	}

	setCustomPostTypeSetting = ( revision ) => {
		this.props.updateFields( revision );
		this.props.markChanged();
	}

	submitFormAndActivateCustomContentModule = ( event ) => {
		this.props.handleSubmitForm( event );

		// Only need to activate module for Jetpack sites
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		// Jetpack support applies only to more recent versions
		if ( ! this.props.jetpackVersionSupportsCustomTypes ) {
			return;
		}

		// No action necessary if neither content type is enabled in form
		if ( ! this.props.fields.jetpack_testimonial && ! this.props.fields.jetpack_portfolio ) {
			return;
		}

		// Only activate module if not already activated (saves an unnecessary
		// request for post types after submission completes)
		if ( ! this.props.jetpackCustomTypesModuleActive ) {
			// [TODO]: This should be migrated to a Redux action creator, but
			// is complicated by requirements to sync back to legacy sites-list
			this.props.site.activateModule( 'custom-content-types', this.onSaveComplete );
		}
	};

	renderSectionHeader( title, showButton = true ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.submitFormAndActivateCustomContentModule }
						disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	}

	render() {
		const {
			eventTracker,
			fields,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			jetpackVersionSupportsCustomTypes,
			onChangeField,
			markChanged,
			siteId,
			trackEvent,
			translate
		} = this.props;
		const markdownSupported = fields.markdown_supported;
		return (
			<form
				id="site-settings"
				onSubmit={ this.submitFormAndActivateCustomContentModule }
				onChange={ markChanged }
				className="site-settings__general-settings"
			>
				{ config.isEnabled( 'manage/site-settings/categories' ) &&
					<div className="site-settings__taxonomies">
						<QueryTaxonomies siteId={ siteId } postType="post" />
						<TaxonomyCard taxonomy="category" postType="post" />
						<TaxonomyCard taxonomy="post_tag" postType="post" />
					</div>
				}

				{ this.renderSectionHeader( translate( 'Composing' ) ) }
				<Card className="site-settings">
					<FormFieldset>
						<FormLabel htmlFor="default_post_format">
							{ translate( 'Default Post Format' ) }
						</FormLabel>
						<FormSelect
							name="default_post_format"
							id="default_post_format"
							value={ fields.default_post_format }
							onChange={ onChangeField( 'default_post_format' ) }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Selected Default Post Format' ) }>
							<option value="0">{ translate( 'Standard', { context: 'Post format' } ) }</option>
							<option value="aside">{ translate( 'Aside', { context: 'Post format' } ) }</option>
							<option value="chat">{ translate( 'Chat', { context: 'Post format' } ) }</option>
							<option value="gallery">{ translate( 'Gallery', { context: 'Post format' } ) }</option>
							<option value="link">{ translate( 'Link', { context: 'Post format' } ) }</option>
							<option value="image">{ translate( 'Image', { context: 'Post format' } ) }</option>
							<option value="quote">{ translate( 'Quote', { context: 'Post format' } ) }</option>
							<option value="status">{ translate( 'Status', { context: 'Post format' } ) }</option>
							<option value="video">{ translate( 'Video', { context: 'Post format' } ) }</option>
							<option value="audio">{ translate( 'Audio', { context: 'Post format' } ) }</option>
						</FormSelect>
					</FormFieldset>

					{ markdownSupported &&
						<FormFieldset className="has-divider is-top-only">
							<FormLabel>
								{ translate( 'Markdown' ) }
							</FormLabel>
							<FormLabel>
								<FormToggle
									className="is-compact"
									name="wpcom_publish_posts_with_markdown"
									checked={ !! fields.wpcom_publish_posts_with_markdown }
									onChange={ handleToggle( 'wpcom_publish_posts_with_markdown' ) }
									disabled={ isRequestingSettings }
								>
									<span className="site-settings__toggle-label">{
										translate( 'Use markdown for posts and pages. {{a}}Learn more about markdown{{/a}}.', {
											components: {
												a: (
													<a
														href="http://en.support.wordpress.com/markdown-quick-reference/"
														target="_blank"
														rel="noopener noreferrer"
													/>
												)
											}
										} )
									}</span>
								</FormToggle>
							</FormLabel>
						</FormFieldset>
					}
				</Card>

				{ config.isEnabled( 'manage/custom-post-types' ) && jetpackVersionSupportsCustomTypes && (
					<div>
						{ this.renderSectionHeader( translate( 'Custom Content Types' ) ) }
						<Card className="site-settings">
							<CustomPostTypeFieldset
								requestingSettings={ isRequestingSettings }
								value={ pick( fields, 'jetpack_testimonial', 'jetpack_portfolio' ) }
								onChange={ this.setCustomPostTypeSetting }
								recordEvent={ trackEvent }
								className="site-settings__custom-post-type-fieldset" />
						</Card>
					</div>
				) }

				{
					this.props.isJetpackSite && this.props.jetpackSettingsUISupported && (
						<div>
							<QueryJetpackModules siteId={ this.props.siteId } />

							<ThemeEnhancements
								onSubmitForm={ this.submitFormAndActivateCustomContentModule }
								handleToggle={ handleToggle }
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								fields={ fields }
							/>

							{ config.isEnabled( 'press-this' ) &&
								<PublishingTools
									onSubmitForm={ this.submitFormAndActivateCustomContentModule }
									isSavingSettings={ isSavingSettings }
									isRequestingSettings={ isRequestingSettings }
									fields={ fields }
								/>
							}
						</div>
					)
				}

				{ config.isEnabled( 'press-this' ) && ! ( this.props.isJetpackSite || this.props.jetpackSettingsUISupported ) && (
					<div>
						{
							this.renderSectionHeader( translate( 'Press This', {
								context: 'name of browser bookmarklet tool'
							} ), false )
						}
						<PressThis />
					</div>
				) }
			</form>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			jetpackCustomTypesModuleActive: false !== isJetpackModuleActive( state, siteId, 'custom-content-types' ),
			jetpackVersionSupportsCustomTypes: false !== isJetpackMinimumVersion( state, siteId, '4.2.0' ),
			jetpackSettingsUISupported: siteSupportsJetpackSettingsUi( state, siteId ),
			isJetpackSite: isJetpackSite( state, siteId ),
			siteId
		};
	},
	{ requestPostTypes },
	null,
	{ pure: false }
);

const getFormSettings = partialRight( pick, [
	'default_post_format',
	'wpcom_publish_posts_with_markdown',
	'markdown_supported',
	'jetpack_testimonial',
	'jetpack_portfolio',
	'infinite_scroll',
	'infinite_scroll_google_analytics',
	'wp_mobile_excerpt',
	'wp_mobile_featured_images',
	'wp_mobile_app_promos',
	'post_by_email_address'
] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormWriting );
