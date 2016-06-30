/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DiscoverHelper = require( './helper' );

var DiscoverSiteAttribution = React.createClass( {

	propTypes: {
		attribution: React.PropTypes.shape( {
			blog_name: React.PropTypes.string.isRequired,
			blog_url: React.PropTypes.string.isRequired,
			avatar_url: React.PropTypes.string
		} ).isRequired,
		siteUrl: React.PropTypes.string.isRequired
	},

	render: function() {
		const attribution = this.props.attribution;
		const classes = classNames( 'discover-attribution is-site', {
			'is-missing-avatar': ! attribution.avatar_url
		} );
		const siteLinkProps = DiscoverHelper.getLinkProps( this.props.siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		return (
			<div className={ classes }>
				{ attribution.avatar_url ? <img className="gravatar" src={ encodeURI( attribution.avatar_url ) } alt="Avatar" width="20" height="20" /> : <span className="noticon noticon-website"></span> }
				<span>
					<a { ...siteLinkProps } className={ siteClasses } href={ encodeURI( this.props.siteUrl ) }>
						{ this.translate( 'visit' ) } <em>{ attribution.blog_name }</em>
					</a>
				</span>
			</div>
		);
	}

} );

module.exports = DiscoverSiteAttribution;
