/**
 * External dependencies
 */
var React = require( 'react' ),
	pick = require( 'lodash/object/pick' ),
	find = require( 'lodash/collection/find' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Accordion = require( 'components/accordion' ),
	Gridicon = require( 'components/gridicon' ),
	siteUtils = require( 'lib/site/utils' ),
	PostFormats = require( './' );

module.exports = React.createClass( {
	displayName: 'EditorPostFormatsAccordion',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		postFormats: React.PropTypes.arrayOf( React.PropTypes.shape( {
			slug: React.PropTypes.string,
			label: React.PropTypes.string
		} ) )
	},

	getFormatValue: function() {
		if ( ! this.props.post ) {
			return;
		}

		if ( this.props.post.format ) {
			return this.props.post.format;
		}

		return siteUtils.getDefaultPostFormat( this.props.site );
	},

	getSubtitle: function() {
		var postFormat;

		if ( ! this.props.post || ! this.props.postFormats ) {
			return this.translate( 'Loading…' );
		}

		postFormat = find( this.props.postFormats, {
			slug: this.getFormatValue() || 'standard'
		} );

		if ( postFormat ) {
			return postFormat.label;
		}

		return this.translate( 'Standard', { context: 'Post format' } );
	},

	render: function() {
		var classes = classNames( 'editor-post-formats__accordion', this.props.className, {
			'is-loading': ! this.props.post || ! this.props.postFormats
		} );

		if ( ! this.props.postFormats || this.props.postFormats.length <= 1 ) {
			return null;
		}

		return (
			<Accordion
				title={ this.translate( 'Post Format' ) }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="types" /> }
				className={ classes }>
				<PostFormats
					{ ...pick( this.props, 'post', 'postFormats' ) }
					value={ this.getFormatValue() } />
			</Accordion>
		);
	}
} );
