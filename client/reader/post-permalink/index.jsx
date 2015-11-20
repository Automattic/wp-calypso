/**
 * External dependencies
 */
var React = require( 'react' );

// Internal Dependencies
var stats = require( 'reader/stats' );

var PostPermalink = React.createClass( {

	propTypes: {
		siteName: React.PropTypes.string,
		postUrl: React.PropTypes.string
	},

	recordClick: function() {
		stats.recordPermalinkClick( 'card_visit_link' );
		stats.recordGaEvent( 'Clicked Card Permalink' );
	},

	render: function() {
		if ( ! this.props.siteName || ! this.props.postUrl ) {
			return null;
		}

		return (
			<li className="post-permalink" onClick={ this.recordClick }>
				<a href={ this.props.postUrl } rel="external" target="_blank">
					{ this.translate( 'Visit', { comment: 'Visit the post on the original site' } ) }
				</a>
			</li>
		);
	}
} );

module.exports = PostPermalink;
