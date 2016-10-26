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
	},

	render: function() {
		if ( ! this.props.siteName || ! this.props.postUrl ) {
			return null;
		}

		/* eslint-disable react/jsx-no-target-blank */
		return (
			<li className="post-permalink" onClick={ this.recordClick }>
				<ExternalLink href={ this.props.postUrl } target="_blank" icon={ true } iconSize={ 16 }>
					{ this.translate( 'Visit', { comment: 'Visit the post on the original site' } ) }
				</ExternalLink>
			</li>
		);
		/* eslint-enable react/jsx-no-target-blank */
	}
} );

module.exports = PostPermalink;
