/**
 * External dependencies
 */
var React = require( 'react' ),
	pick = require( 'lodash/pick' ),
	has = require( 'lodash' ).has,
	classNames = require( 'classnames' ),
	isEmpty = require( 'lodash/isEmpty' );

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
		postFormats: React.PropTypes.object
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
		const formatValue = this.getFormatValue();

		if ( ! this.props.post || ! this.props.postFormats ) {
			return this.translate( 'Loading…' );
		}

		if ( has( this.props.postFormats, formatValue ) ) {
			return this.props.postFormats[ formatValue ];
		}

		return this.translate( 'Standard', { context: 'Post format' } );
	},

	render: function() {
		var classes = classNames( 'editor-post-formats__accordion', this.props.className, {
			'is-loading': ! this.props.post || ! this.props.postFormats
		} );

		if ( isEmpty( this.props.postFormats ) ) {
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
