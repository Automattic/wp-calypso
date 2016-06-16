/**
 * External Dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var ExternalLink = require( 'components/external-link' ),
	Gravatar = require( 'components/gravatar' ),
	Gridicon = require( 'components/gridicon' ),
	PostTime = require( 'reader/post-time' ),
	utils = require( 'reader/utils' ),
	stats = require( 'reader/stats' );

var PostByline = React.createClass( {

	recordTagClick: function() {
		stats.recordAction( 'click_tag' );
		stats.recordGaEvent( 'Clicked Tag Link' );
		stats.recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: this.props.post.primary_tag.slug
		} );
	},

	recordDateClick: function() {
		stats.recordPermalinkClick( 'timestamp' );
		stats.recordGaEvent( 'Clicked Post Permalink', 'timestamp' );
	},

	recordAuthorClick: function() {
		stats.recordAction( 'click_author' );
		stats.recordGaEvent( 'Clicked Author Link' );
		stats.recordTrackForPost( 'calypso_reader_author_link_clicked', this.props.post );
	},

	renderAuthorName: function() {
		const post = this.props.post,
			gravatar = ( <Gravatar user={ post.author } size={ 24 } /> ),
			authorName = ( <span className="byline__author-name">{ post.author.name }</span> );

		if ( ! post.author.URL ) {
			return (
				<span>
					{ gravatar }
					{ authorName }
				</span>
			);
		}

		return (
			<ExternalLink href={ post.author.URL } target="_blank" onClick={ this.recordAuthorClick }>
				{ gravatar }
				{ authorName }
			</ExternalLink>
		);
	},

	render: function() {
		var post = this.props.post,
			site = this.props.site,
			siteName = utils.siteNameFromSiteAndPost( site, post ),
			primaryTag = post && post.primary_tag;

		if ( ! siteName ) {
			siteName = this.translate( '(no title)' );
		}

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<ul className="reader-post-byline">
			{ post.author && post.author.name ?
				<li className="reader-post-byline__author">
					{ this.renderAuthorName() }
				</li> : null }
			{ post.date && post.URL ?
				<li className="reader-post-byline__date">
					<a className="reader-post-byline__date-link"
						onClick={ this.recordDateClick }
						href={ post.URL }
						target="_blank"><PostTime date={ post.date } />{ this.props.icon ? <Gridicon icon="external" size={ 14 } /> : null }</a>
				</li> : null }
			{ primaryTag ?
				<li className="reader-post-byline__tag">
					<a href={ '/tag/' + primaryTag.slug } className="ignore-click" onClick={ this.recordTagClick }><Gridicon icon="tag" size={ 16 } /> { primaryTag.display_name }</a>
				</li> : null }
			</ul>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}

} );

module.exports = PostByline;
