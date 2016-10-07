/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { map, some } from 'lodash';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import Gridicon from 'components/gridicon';
import PostActions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import AccordionSection from 'components/accordion/section';
import EditorThemeHelp from 'post-editor/editor-theme-help';

export default React.createClass( {
	displayName: 'EditorPostFormats',

	propTypes: {
		post: PropTypes.object,
		value: PropTypes.string,
		postFormats: PropTypes.object
	},

	getDefaultProps() {
		return {
			value: 'standard'
		};
	},

	getSelectedPostFormat() {
		const { value } = this.props;

		if ( 'standard' === value ) {
			return 'standard';
		}

		const isSupportedFormat = some( this.getPostFormats(), ( postFormatLabel, postFormatSlug ) => {
			return postFormatSlug === value;
		} );

		if ( isSupportedFormat ) {
			return value;
		}

		return 'standard';
	},

	getPostFormats() {
		let formats = {
			standard: this.translate( 'Standard', {
				context: 'Post format'
			} )
		};

		if ( this.props.postFormats ) {
			formats = Object.assign( formats, this.props.postFormats );
		}

		return formats;
	},

	getPostFormatIcon( postFormatSlug ) {
		const icons = {
			aside: 'aside',
			image: 'image',
			video: 'video-camera',
			quote: 'quote',
			link: 'link',
			gallery: 'image-multiple',
			status: 'pencil',
			audio: 'audio',
			chat: 'comment'
		};

		return icons[ postFormatSlug ] ? icons[ postFormatSlug ] : 'posts';
	},

	onChange( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			format: event.target.value
		} );

		recordStat( 'post_format_changed' );
		recordEvent( 'Changed Post Format', event.target.value );
	},

	renderPostFormats() {
		const selectedFormat = this.getSelectedPostFormat();

		return map( this.getPostFormats(), ( postFormatLabel, postFormatSlug ) => {
			return (
				<li key={ postFormatSlug } className="editor-post-formats__format">
					<label>
						<FormRadio
							name="format"
							value={ postFormatSlug }
							checked={ postFormatSlug === selectedFormat }
							onChange={ this.onChange }
						/>
						<span className="editor-post-formats__format-label">
							<span className={ 'editor-post-formats__format-icon' } >
								{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
								<Gridicon icon={ this.getPostFormatIcon( postFormatSlug ) } size={ 20 } />
								{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							</span>
							{ postFormatLabel }
						</span>
					</label>
				</li>
			);
		} );
	},

	render() {
		return (
			<AccordionSection>
				<EditorThemeHelp className="editor-post-formats__help-link" />
				<ul className="editor-post-formats">
					{ this.renderPostFormats() }
				</ul>
			</AccordionSection>
		);
	}
} );
