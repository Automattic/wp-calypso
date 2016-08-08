/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';
import PostTime from 'reader/post-time';
import { siteNameFromSiteAndPost } from 'reader/utils';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick
 } from 'reader/stats';

class PostByline extends React.Component {

	constructor( ) {
		super( );
		this.recordTagClick = this.recordTagClick.bind( this );
		this.recordAuthorClick = this.recordAuthorClick.bind( this );
	}

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		site: React.PropTypes.object,
		icon: React.PropTypes.bool,
		isDiscoverPost: React.PropTypes.bool
	}

	static defaultProps = {
		icon: false,
		isDiscoverPost: false
	}

	recordTagClick() {
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: this.props.post.primary_tag.slug
		} );
	}

	recordDateClick() {
		recordPermalinkClick( 'timestamp' );
		recordGaEvent( 'Clicked Post Permalink', 'timestamp' );
	}

	recordAuthorClick() {
		recordAction( 'click_author' );
		recordGaEvent( 'Clicked Author Link' );
		recordTrackForPost( 'calypso_reader_author_link_clicked', this.props.post );
	}

	renderAuthorName() {
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
	}

	render() {
		const { post, site, icon, isDiscoverPost } = this.props,
			primaryTag = post && post.primary_tag;
		let siteName = siteNameFromSiteAndPost( site, post );

		if ( ! siteName ) {
			siteName = this.translate( '(no title)' );
		}

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<ul className="reader-post-byline">
			{ ! isDiscoverPost && post.author && post.author.name ?
				<li className="reader-post-byline__author">
					{ this.renderAuthorName() }
				</li> : null }
			{ post.date && post.URL ?
				<li className="reader-post-byline__date">
					<a className="reader-post-byline__date-link"
						onClick={ this.recordDateClick }
						href={ post.URL }
						target="_blank"><PostTime date={ post.date } />{ icon ? <Gridicon icon="external" size={ 14 } /> : null }</a>
				</li> : null }
			{ primaryTag ?
				<li className="reader-post-byline__tag">
					<a href={ '/tag/' + primaryTag.slug } className="ignore-click" onClick={ this.recordTagClick }><Gridicon icon="tag" size={ 16 } /> { primaryTag.name }</a>
				</li> : null }
			</ul>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}

}

export default PostByline;
