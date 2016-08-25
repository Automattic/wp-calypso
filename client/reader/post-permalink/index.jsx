/**
 * External dependencies
 */
var React = require( 'react' );

// Internal Dependencies
var ExternalLink = require( 'components/external-link' ),
	stats = require( 'reader/stats' );

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
				<ExternalLink href={ this.props.postUrl } target="_blank" rel="external noopener noreferrer" icon={ true } iconSize={ 16 }>
					{ this.translate( 'Visit', { comment: 'Visit the post on the original site' } ) }
				</ExternalLink>
			</li>
		);
	}
} );

module.exports = PostPermalink;
