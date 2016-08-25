/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'StatsInfoPanel',

	mixins: [ PureRenderMixin ],

	propTypes: {
		module: PropTypes.string
	},

	recordEvent() {
		analytics.ga.recordEvent( 'Stats', 'Clicked More Panel Information Help Link', titlecase( this.props.module ) );
	},

	render() {
		const infoPanelClass = 'module-content-text module-content-text-info';
		let infoView;

		switch ( this.props.module ) {

			case 'referrers':
				infoView = (
					<div className={ infoPanelClass }>
						<p>{ this.translate( 'Learn more about your site’s visibility by looking at the websites and search engines that send the most traffic your way.' ) }</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://en.support.wordpress.com/stats/#marking-spam-referrers">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I mark a referrer as spam?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://en.support.wordpress.com/stats/#referrers">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/stats/#clicks">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/stats/#search-engine-terms">
									<Gridicon icon="info-outline" />
									{ this.translate( 'About Search Terms', { context: 'Stats: search terms info module documentation link' } ) }
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/getting-more-views-and-traffic/#use-appropriate-tags">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I tag content effectively?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/posts/categories-vs-tags/">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/getting-more-views-and-traffic/">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I get more visitors?', {
										context: 'Stats: Posts & Pages info box documentation link'
									} ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/stats/#top-posts-pages">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/adding-users/">
									<Gridicon icon="help-outline" />
									{ this.translate( 'How do I invite someone to my website?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/category/users/">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/videos/">
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
								<a
									onClick={ this.recordEvent }
									target="_blank" rel="noopener noreferrer"
									href="http://en.support.wordpress.com/publicize/">
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
