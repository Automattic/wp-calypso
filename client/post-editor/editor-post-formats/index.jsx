/**
 * External dependencies
 */
const React = require( 'react' );
const map = require( 'lodash' ).map;
const some = require( 'lodash' ).some;

/**
 * Internal dependencies
 */
const FormRadio = require( 'components/forms/form-radio' ),
	Gridicon = require( 'components/gridicon' ),
	PostActions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' ),
	AccordionSection = require( 'components/accordion/section' );
import EditorThemeHelp from 'post-editor/editor-theme-help';

export default React.createClass( {
	displayName: 'EditorPostFormats',

	propTypes: {
		post: React.PropTypes.object,
		value: React.PropTypes.string,
		postFormats: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			value: 'standard'
		};
	},

	getSelectedPostFormat: function() {
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

	getPostFormats: function() {
		var formats = {
			standard: this.translate( 'Standard', { context: 'Post format' } )
		};

		if ( this.props.postFormats ) {
			formats = Object.assign( formats, this.props.postFormats );
		}

		return formats;
	},

	getPostFormatIcon: function( postFormatSlug ) {
		var icons = {
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

	onChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			format: event.target.value
		} );

		stats.recordStat( 'post_format_changed' );
		stats.recordEvent( 'Changed Post Format', event.target.value );
	},

	renderPostFormats: function() {
		var selectedFormat = this.getSelectedPostFormat();

		return map( this.getPostFormats(), ( postFormatLabel, postFormatSlug ) => {
			return (
				<li key={ postFormatSlug } className="editor-post-formats__format">
					<label>
						<FormRadio
							name="format"
							value={ postFormatSlug }
							checked={ postFormatSlug === selectedFormat }
							onChange={ this.onChange } />
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
		}, this );
	},

	render: function() {
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
