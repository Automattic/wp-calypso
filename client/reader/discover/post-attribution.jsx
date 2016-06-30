/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DiscoverHelper = require( './helper' ),
	stats = require( 'reader/stats' );

var arrowGridicon = ( <svg className="gridicon gridicon-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 11H6.414l6.293-6.293-1.414-1.414L2.586 12l8.707 8.707 1.414-1.414L6.414 13H20"/></svg> );

var DiscoverPostAttribution = React.createClass( {

	propTypes: {
		attribution: React.PropTypes.shape( {
			author_name: React.PropTypes.string.isRequired,
			author_url: React.PropTypes.string.isRequired,
			blog_name: React.PropTypes.string.isRequired,
			blog_url: React.PropTypes.string.isRequired,
			avatar_url: React.PropTypes.string
		} ).isRequired,
		siteUrl: React.PropTypes.string.isRequired
	},

	recordAuthorClick() {
		stats.recordTrack( 'calypso_reader_author_on_discover_card_clicked', {
			author_url: this.props.attribution.author_url
		} );
	},

	recordSiteClick() {
		stats.recordTrack( 'calypso_reader_site_on_discover_card_clicked', {
			site_url: this.props.siteUrl
		} );
	},

	render() {
		const attribution = this.props.attribution;
		const classes = classNames( 'discover-attribution is-post', {
			'is-missing-avatar': ! attribution.avatar_url
		} );
		const siteLinkProps = DiscoverHelper.getLinkProps( this.props.siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		return (
			<div className={ classes }>
				{ attribution.avatar_url ? <img className="gravatar" src={ encodeURI( attribution.avatar_url ) } alt="Avatar" width="20" height="20" /> : arrowGridicon }
				<span className="discover-attribution__text">
					{ this.translate( 'Originally posted by' ) }
					<a className="discover-attribution__author" rel="external" target="_blank" onClick={ this.recordAuthorClick } href={ encodeURI( attribution.author_url ) }>{ attribution.author_name }</a>
					{ this.translate( 'on' ) }
					<a { ...siteLinkProps } className={ siteClasses } onClick={ this.recordSiteClick } href={ encodeURI( this.props.siteUrl ) }>{ attribution.blog_name }</a>
				</span>
			</div>
		);
	}

} );

module.exports = DiscoverPostAttribution;
