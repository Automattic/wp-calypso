/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const FormRadio = require( 'components/forms/form-radio' ),
	Gridicon = require( 'components/gridicon' ),
	PostActions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' ),
	AccordionSection = require( 'components/accordion/section' );

export default React.createClass( {
	displayName: 'EditorPostFormats',

	propTypes: {
		post: React.PropTypes.object,
		value: React.PropTypes.string,
		postFormats: React.PropTypes.arrayOf( React.PropTypes.shape( {
			slug: React.PropTypes.string,
			label: React.PropTypes.string
		} ) )
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

		const isSupportedFormat = this.getPostFormats().some( ( postFormat ) => {
			return postFormat.slug === value;
		} );

		if ( isSupportedFormat ) {
			return value;
		}

		return 'standard';
	},

	getPostFormats: function() {
		var formats = [ {
			slug: 'standard',
			label: this.translate( 'Standard', { context: 'Post format' } )
		} ];

		if ( this.props.postFormats ) {
			formats = formats.concat( this.props.postFormats );
		}

		return formats;
	},

	getPostFormatIcon: function( postFormat ) {
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

		return icons[ postFormat.slug ] ? icons[ postFormat.slug ] : 'posts';
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

		return this.getPostFormats().map( function( postFormat ) {
			return (
				<li key={ postFormat.slug } className="editor-post-formats__format">
					<label>
						<FormRadio
							name="format"
							value={ postFormat.slug }
							checked={ postFormat.slug === selectedFormat }
							onChange={ this.onChange } />
						<span className="editor-post-formats__format-label">
							<span className={ 'editor-post-formats__format-icon' } >
								{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
								<Gridicon icon={ this.getPostFormatIcon( postFormat ) } size={ 20 } />
								{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							</span>
							{ postFormat.label }
						</span>
					</label>
				</li>
			);
		}, this );
	},

	render: function() {
		return (
			<AccordionSection>
				<ul className="editor-post-formats">
					{ this.renderPostFormats() }
				</ul>
			</AccordionSection>
		);
	}
} );
