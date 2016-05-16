/**
 * External dependencies
 */
const React = require( 'react' );
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
const FormRadio = require( 'components/forms/form-radio' ),
	Gridicon = require( 'components/gridicon' ),
	PostActions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' ),
	AccordionSection = require( 'components/accordion/section' );
import { setPostFormat } from 'state/ui/editor/post/actions';

const EditorPostFormats = React.createClass( {
	displayName: 'EditorPostFormats',

	propTypes: {
		setPostFormat: React.PropTypes.func,
		post: React.PropTypes.object,
		value: React.PropTypes.string,
		postFormats: React.PropTypes.arrayOf( React.PropTypes.shape( {
			slug: React.PropTypes.string,
			label: React.PropTypes.string
		} ) )
	},

	getDefaultProps: function() {
		return {
			setPostFormat: () => {},
			value: 'standard'
		};
	},

	getSelectedPostFormat: function() {
		var validSlugs = this.getPostFormats().map( function( postFormat ) {
			return postFormat.slug;
		} );

		if ( includes( validSlugs, this.props.value ) ) {
			return this.props.value;
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

		this.props.setPostFormat( event.target.value );

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
								<Gridicon icon={ this.getPostFormatIcon( postFormat ) } size={ 18 } />
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

export default connect(
	null,
	dispatch => bindActionCreators( { setPostFormat }, dispatch ),
	null,
	{ pure: false }
)( EditorPostFormats );
