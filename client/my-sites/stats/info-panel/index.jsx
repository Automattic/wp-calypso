/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:stats:info-panel' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	titlecase = require( 'to-title-case' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsInfoPanel',

	recordEvent: function() {
		analytics.ga.recordEvent( 'Stats', 'Clicked More Panel Information Help Link', titlecase( this.props.module ) );
	},

	render: function() {
		debug('Rendering stats info panel', this.props );
		var infoView,
			infoPanelClass = "module-content-text module-content-text-info";

		switch( this.props.module ) {

			case 'referrers':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Learn more about your site’s visibility by looking at the websites and search engines that send the most traffic your way.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/stats/#marking-spam-referrers" target="_blank">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I mark a referrer as spam?' ) }
								</a>
							</li>
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/stats/#referrers" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Referrers' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'clicks':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'When your content includes links to other sites, you’ll see which ones your visitors click on the most.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/stats/#clicks" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Clicks' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'searchterms':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Learn more about your search traffic by looking at the terms your visitors searched for to find your site.', { context: 'Stats: search terms info module' } ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/stats/#search-engine-terms" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Search Terms', { context: 'Stats: search terms info module documentation link' }  ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'tags-categories':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Get an overview of the most popular topics on your site, as reflected in your top posts and pages from the past week.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/getting-more-views-and-traffic/#use-appropriate-tags" target="_blank">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I tag content effectively?' ) }
								</a>
							</li>
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/posts/categories-vs-tags/" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Tags & Categories' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'posts':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.translate( 'Discover what your most-viewed content is, and check how individual posts and pages perform over time.', {
								context: 'Stats: Posts & Pages info box description'
							} ) }
						</p>
						<p className="legend published">
							{ this.translate( '= The post or page was published within the selected period', {
								context: 'Legend for the posts & pages panel in Stats',
								comment: 'A vertical, orange bar is displayed to the left of the = sign.'
							} ) }
						</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/getting-more-views-and-traffic/" target="_blank">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I get more visitors?', {
										context: 'Stats: Posts & Pages info box documentation link'
									} ) }
								</a>
							</li>
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/stats/#top-posts-pages" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Posts & Pages', {
										context: 'Stats: Posts & Pages info box documentation link'
									} ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'authors':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Track the views on each contributor’s posts or pages, and zoom in to discover the most popular content by each author.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/adding-users/" target="_blank">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I invite someone to my website?' ) }
								</a>
							</li>
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/category/users/" target="_blank">
									<Gridicon icon="folder" />
									{ this.translate( 'About Users' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'videoplays':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'If you’ve uploaded videos using VideoPress, find out how many times they’ve been watched.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/videos/" target="_blank">
									<Gridicon icon="folder" />
									{ this.translate( 'About Videos on WordPress.com' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'publicize':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Keep track of your followers from various social networking services using publicize.' ) }</p>
						<ul className="documentation">
							<li>
								<a onClick={ this.recordEvent } href="http://en.support.wordpress.com/publicize/" target="_blank">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Publicize' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

		}

		return infoView;

	}
} );
