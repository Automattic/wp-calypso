/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { gaRecordEvent } from 'lib/analytics/ga';
import titlecase from 'to-title-case';

class StatsInfoPanel extends React.PureComponent {
	static displayName = 'StatsInfoPanel';

	static propTypes = {
		module: PropTypes.string,
	};

	recordEvent = () => {
		gaRecordEvent(
			'Stats',
			'Clicked More Panel Information Help Link',
			titlecase( this.props.module )
		);
	};

	render() {
		const infoPanelClass = 'module-content-text module-content-text-info';
		let infoView;

		switch ( this.props.module ) {
			case 'referrers':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'Learn more about your site’s visibility by looking at the websites and search engines that send the most traffic your way.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/stats/#marking-spam-referrers"
								>
									<Gridicon icon="help-outline" />
									{ this.props.translate( 'How do I mark a referrer as spam?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/stats/#referrers"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Referrers' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'clicks':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'When your content includes links to other sites, you’ll see which ones your visitors click on the most.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/stats/#clicks"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Clicks' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'searchterms':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'Learn more about your search traffic by looking at the terms your visitors searched for to find your site.',
								{ context: 'Stats: search terms info module' }
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/stats/#search-engine-terms"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Search Terms', {
										context: 'Stats: search terms info module documentation link',
									} ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'tags-categories':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'Get an overview of the most popular topics on your site, as reflected in your top posts and pages from the past week.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/getting-more-views-and-traffic/#use-appropriate-tags"
								>
									<Gridicon icon="help-outline" />
									{ this.props.translate( 'How do I tag content effectively?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/posts/categories-vs-tags/"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Tags & Categories' ) }
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
							{ this.props.translate(
								'Discover what your most-viewed content is, and check how individual posts and pages perform over time.',
								{
									context: 'Stats: Posts & Pages info box description',
								}
							) }
						</p>
						<p className="legend published">
							{ this.props.translate(
								'= The post or page was published within the selected period',
								{
									context: 'Legend for the posts & pages panel in Stats',
									comment: 'A vertical, orange bar is displayed to the left of the = sign.',
								}
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/getting-more-views-and-traffic/"
								>
									<Gridicon icon="help-outline" />
									{ this.props.translate( 'How do I get more visitors?', {
										context: 'Stats: Posts & Pages info box documentation link',
									} ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/stats/#top-posts-pages"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Posts & Pages', {
										context: 'Stats: Posts & Pages info box documentation link',
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
						<p>
							{ this.props.translate(
								'Track the views on each contributor’s posts or pages, and zoom in to discover the most popular content by each author.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/adding-users/"
								>
									<Gridicon icon="help-outline" />
									{ this.props.translate( 'How do I invite someone to my website?' ) }
								</a>
							</li>
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/category/users/"
								>
									<Gridicon icon="folder" />
									{ this.props.translate( 'About Users' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'videoplays':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'If you’ve uploaded videos using VideoPress, find out how many times they’ve been watched.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/videos/"
								>
									<Gridicon icon="folder" />
									{ this.props.translate( 'About Videos on WordPress.com' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;

			case 'publicize':
				infoView = (
					<div className={ infoPanelClass }>
						<p>
							{ this.props.translate(
								'Keep track of your followers from various social networking services using publicize.'
							) }
						</p>
						<ul className="documentation">
							<li>
								<a
									onClick={ this.recordEvent }
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpress.com/support/publicize/"
								>
									<Gridicon icon="info-outline" />
									{ this.props.translate( 'About Publicize' ) }
								</a>
							</li>
						</ul>
					</div>
				);
				break;
		}
		return infoView;
	}
}

export default localize( StatsInfoPanel );
