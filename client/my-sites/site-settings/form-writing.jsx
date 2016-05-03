/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import each from 'lodash/each';
import pick from 'lodash/pick';

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
import FormLabel from 'components/forms/form-label';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import { requestPostTypes } from 'state/post-types/actions';
import CustomPostTypeFieldset from './custom-post-types-fieldset';

const SiteSettingsFormWriting = React.createClass( {
	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

	getSettingsFromSite: function( site ) {
		var writingAttributes = [
				'default_category',
				'post_categories',
				'default_post_format'
			],
			settings = {};

		site = site || this.props.site;

		if ( ! site.jetpack ) {
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
		settings.post_categories = settings.post_categories || [];

		return settings;
	},

	resetState: function() {
		this.replaceState( {
			fetchingSettings: true,
			default_category: '',
			post_categories: [],
			default_post_format: '',
		} );
	},

	onSaveComplete() {
		const { site } = this.props;
		if ( ! site || site.jetpack ) {
			return;
		}

		this.props.requestPostTypes( this.props.site.ID );
	},

	setCustomPostTypeSetting( revision ) {
		this.setState( revision );

		each( revision, ( value, key ) => {
			this.linkState( key ).requestChange( value );
		} );

		this.markChanged();
	},

	render: function() {
		return (
			<form id="site-settings" onSubmit={ this.submitForm } onChange={ this.markChanged }>
				<SectionHeader label={ this.translate( 'Writing Settings' ) }>
					<Button
						compact
						primary
						onClick={ this.submitForm }
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="site-settings">
					<FormFieldset>
						<FormLabel htmlFor="default_category">
							{ this.translate( 'Default Post Category' ) }
						</FormLabel>
						<FormSelect
							name="default_category"
							id="default_category"
							valueLink={ this.linkState( 'default_category' ) }
							disabled={ this.state.fetchingSettings }
							onClick={ this.recordEvent.bind( this, 'Selected Default Post Category' ) }>
							{ this.state.post_categories.map( function( category ) {
								return <option value={ category.value } key={ 'post-category-' + category.value }>{ category.name }</option>;
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

					{ ( ! this.props.site || ! this.props.site.jetpack ) && (
						<CustomPostTypeFieldset
							requestingSettings={ this.state.fetchingSettings }
							value={ pick( this.state, 'jetpack_testimonial', 'jetpack_portfolio' ) }
							onChange={ this.setCustomPostTypeSetting }
							recordEvent={ this.recordEvent }
							className="has-divider is-top-only" />
					) }

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
										{ this.translate( 'Press This', { context: 'name of browser bookmarklet tool' } ) }
									</PressThisLink>
								</p>
							</div>
						</FormFieldset>
					}
				</Card>
			</form>

		);
	}
} );

export default connect( null, {
	requestPostTypes
}, null, {
	pure: false
} )( SiteSettingsFormWriting );
