// External dependencies
var React = require( 'react' ),
	classnames = require( 'classnames' );

// Internal Dependencies
var stats = require( 'reader/stats' ),
	DiscoverHelper = require( './helper' );

var DiscoverVisitLink = React.createClass( {

	propTypes: {
		siteName: React.PropTypes.string,
		siteUrl: React.PropTypes.string
	},

	recordClick: function() {
		stats.recordPermalinkClick( 'discover_summary_card_site_name' );
		stats.recordGaEvent( 'Clicked Discover Permalink' );
	},

	render: function() {
		var siteLinkProps = DiscoverHelper.getLinkProps( this.props.siteUrl ),
			siteName = ( <a { ...siteLinkProps } onClick={ this.recordClick } href={ this.props.siteUrl }>
				<span>{ this.props.siteName || '(untitled)' }</span>
			</a> ),
			classes = classnames( 'discover-visit-link' );

		if ( ! this.props.siteName || ! this.props.siteUrl ) {
			return null;
		}

		return (
			<div className={ classes }>
				{ this.translate( 'Visit {{siteName/}} for more', { components: { siteName } } ) }
			</div>
		);
	}
} );

module.exports = DiscoverVisitLink;
