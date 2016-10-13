/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { each, pick, map } from 'lodash';

/**
 * Internal dependencies
 */
import formBase from './form-base';
import protectForm from 'lib/mixins/protect-form';
import config from 'config';
import PressThisLink from './press-this-link';
import dirtyLinkedState from 'lib/mixins/dirty-linked-state';
import FormSelect from 'components/forms/form-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import QueryTerms from 'components/data/query-terms';
import TaxonomyManager from 'blocks/taxonomy-manager';
import { isJetpackModuleActive, isJetpackMinimumVersion } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestPostTypes } from 'state/post-types/actions';
import { isRequestingTermsForQuery, getTerms } from 'state/terms/selectors';
import CustomPostTypeFieldset from './custom-post-types-fieldset';

const SiteSettingsFormWriting = React.createClass( {
	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

	getSettingsFromSite: function( site ) {
		let writingAttributes = [
			'default_category',
			'default_post_format',
			'wpcom_publish_posts_with_markdown',
			'markdown_supported',
		];
		const settings = {};

		site = site || this.props.site;

		if ( this.isCustomPostTypesSettingsEnabled() ) {
			writingAttributes = writingAttributes.concat( [
				'jetpack_testimonial',
				'jetpack_portfolio'
			] );
		}

		if ( site.settings ) {
			writingAttributes.map( function( attribute ) {
				settings[ attribute ] = site.settings[ attribute ];
			}, this );
		}
		settings.fetchingSettings = site.fetchingSettings;

		return settings;
	},

	isCustomPostTypesSettingsEnabled() {
		return (
			config.isEnabled( 'manage/custom-post-types' ) &&
			this.props.jetpackVersionSupportsCustomTypes
		);
	},

	resetState: function() {
		this.replaceState( {
			fetchingSettings: true,
			default_category: '',
			default_post_format: '',
		} );
	},

	onSaveComplete() {
		if ( this.isCustomPostTypesSettingsEnabled() ) {
			this.props.requestPostTypes( this.props.site.ID );
		}
	},

	setCustomPostTypeSetting( revision ) {
		this.setState( revision );

		each( revision, ( value, key ) => {
			this.linkState( key ).requestChange( value );
		} );

		this.markChanged();
	},

	submitFormAndActivateCustomContentModule( event ) {
		this.handleSubmitForm( event );

		// Only need to activate module for Jetpack sites
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		// Jetpack support applies only to more recent versions
		if ( ! this.props.jetpackVersionSupportsCustomTypes ) {
			return;
		}

		// No action necessary if neither content type is enabled in form
		if ( ! this.state.jetpack_testimonial && ! this.state.jetpack_portfolio ) {
			return;
		}

		// Only activate module if not already activated (saves an unnecessary
		// request for post types after submission completes)
		if ( ! this.props.jetpackCustomTypesModuleActive ) {
			// [TODO]: This should be migrated to a Redux action creator, but
			// is complicated by requirements to sync back to legacy sites-list
			this.props.site.activateModule( 'custom-content-types', this.onSaveComplete );
		}
	},

	render: function() {
		const markdownSupported = this.state.markdown_supported;
		return (
			<form id="site-settings" onSubmit={ this.submitFormAndActivateCustomContentModule } onChange={ this.markChanged }>
				<SectionHeader label={ this.translate( 'Writing Settings' ) }>
					<Button
						compact
						primary
						onClick={ this.submitFormAndActivateCustomContentModule }
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="site-settings">
					<FormFieldset>
						<QueryTerms siteId={ this.props.siteId } taxonomy="category" />
						<FormLabel htmlFor="default_category">
							{ this.translate( 'Default Post Category' ) }
						</FormLabel>
						<FormSelect
							name="default_category"
							id="default_category"
							valueLink={ this.linkState( 'default_category' ) }
							disabled={ this.props.isRequestingCategories }
							onClick={ this.recordEvent.bind( this, 'Selected Default Post Category' ) }>
							{ map(this.props.categories, category => {
								return <option value={ category.ID } key={ 'post-category-' + category.ID }>{ category.name }</option>;
							} ) }
						</FormSelect>
						<FormLabel htmlFor="default_post_format">
							{ this.translate( 'Default Post Format' ) }
						</FormLabel>
						<FormSelect
							name="default_post_format"
							id="default_post_format"
							valueLink={ this.linkState( 'default_post_format' ) }
							disabled={ this.state.fetchingSettings }
							onClick={ this.recordEvent.bind( this, 'Selected Default Post Format' ) }>
							<option value="0">{ this.translate( 'Standard', { context: 'Post format' } ) }</option>
							<option value="aside">{ this.translate( 'Aside', { context: 'Post format' } ) }</option>
							<option value="chat">{ this.translate( 'Chat', { context: 'Post format' } ) }</option>
							<option value="gallery">{ this.translate( 'Gallery', { context: 'Post format' } ) }</option>
							<option value="link">{ this.translate( 'Link', { context: 'Post format' } ) }</option>
							<option value="image">{ this.translate( 'Image', { context: 'Post format' } ) }</option>
							<option value="quote">{ this.translate( 'Quote', { context: 'Post format' } ) }</option>
							<option value="status">{ this.translate( 'Status', { context: 'Post format' } ) }</option>
							<option value="video">{ this.translate( 'Video', { context: 'Post format' } ) }</option>
							<option value="audio">{ this.translate( 'Audio', { context: 'Post format' } ) }</option>
						</FormSelect>
					</FormFieldset>

					{ config.isEnabled( 'manage/custom-post-types' ) && this.props.jetpackVersionSupportsCustomTypes && (
						<CustomPostTypeFieldset
							requestingSettings={ this.state.fetchingSettings }
							value={ pick( this.state, 'jetpack_testimonial', 'jetpack_portfolio' ) }
							onChange={ this.setCustomPostTypeSetting }
							recordEvent={ this.recordEvent }
							className="site-settings__custom-post-type-fieldset has-divider is-top-only" />
					) }
					{ markdownSupported &&
						<FormFieldset className="has-divider is-top-only">
							<FormLabel>
								{ this.translate( 'Markdown' ) }
							</FormLabel>
							<FormLabel>
								<FormCheckbox
									name="wpcom_publish_posts_with_markdown"
									checkedLink={ this.linkState( 'wpcom_publish_posts_with_markdown' ) }
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordEvent.bind( this, 'Clicked Markdown for Posts Checkbox' ) } />
								<span>{ this.translate( 'Use markdown for posts and pages. {{a}}Learn more about markdown{{/a}}.', {
										components: {
											a: <a href="http://en.support.wordpress.com/markdown-quick-reference/" target="_blank" rel="noopener noreferrer" />
										}
									} ) }</span>
							</FormLabel>
						</FormFieldset>
					}

					{ config.isEnabled( 'press-this' ) &&
						<FormFieldset className="has-divider is-top-only">
							<div className="press-this">
								<FormLabel>{ this.translate( 'Press This', { context: 'name of browser bookmarklet tool' } ) }</FormLabel>
								<p>{ this.translate( 'Press This is a bookmarklet: a little app that runs in your browser and lets you grab bits of the web.' ) }</p>
								<p>{ this.translate( 'Use Press This to clip text, images and videos from any web page. Then edit and add more straight from Press This before you save or publish it in a post on your site.' ) }</p>
								<p>{ this.translate( 'Drag-and-drop the following link to your bookmarks bar or right click it and add it to your favorites for a posting shortcut.' ) }</p>
								<p className="pressthis">
									<PressThisLink
										site={ this.props.site }
										onClick={ this.recordEvent.bind( this, 'Clicked Press This Button' ) }
										onDragStart={ this.recordEvent.bind( this, 'Dragged Press This Button' ) }>
										<span className="noticon noticon-pinned"></span>
										<span>{ this.translate( 'Press This', { context: 'name of browser bookmarklet tool' } ) }</span>
									</PressThisLink>
								</p>
							</div>
						</FormFieldset>
					}
				</Card>
				{ config.isEnabled( 'manage/site-settings/categories' ) && <TaxonomyManager taxonomy="category" postType="post" /> }
			</form>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isRequestingCategories = isRequestingTermsForQuery( state, siteId, 'category', {} );
		const categories = getTerms( state, siteId, 'category' );

		return {
			jetpackCustomTypesModuleActive: false !== isJetpackModuleActive( state, siteId, 'custom-content-types' ),
			jetpackVersionSupportsCustomTypes: false !== isJetpackMinimumVersion( state, siteId, '4.2.0' ),
			categories,
			isRequestingCategories,
			siteId
		};
	},
	{ requestPostTypes },
	null,
	{ pure: false }
)( SiteSettingsFormWriting );
