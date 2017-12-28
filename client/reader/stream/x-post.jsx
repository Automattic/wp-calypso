/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import classnames from 'classnames';
import url from 'url';
import { localize } from 'i18n-calypso';
import closest from 'component-closest';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Card from 'client/components/card';
import ReaderAvatar from 'client/blocks/reader-avatar';
import { getSite } from 'client/state/reader/sites/selectors';
import { getFeed } from 'client/state/reader/feeds/selectors';
import QueryReaderSite from 'client/components/data/query-reader-site';
import QueryReaderFeed from 'client/components/data/query-reader-feed';
import Emojify from 'client/components/emojify';

class CrossPost extends PureComponent {
	static propTypes = {
		post: PropTypes.object.isRequired,
		isSelected: PropTypes.bool.isRequired,
		xMetadata: PropTypes.object.isRequired,
		xPostedTo: PropTypes.array,
		handleClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		postKey: PropTypes.object,
		site: PropTypes.object,
		feed: PropTypes.object,
	};

	handleTitleClick = event => {
		// modified clicks should let the default action open a new tab/window
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		event.preventDefault();
		this.props.handleClick( this.props.xMetadata );
	};

	handleCardClick = event => {
		const rootNode = ReactDom.findDOMNode( this );

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		if ( closest( event.target, '.ignore-click', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if (
			closest( event.target, 'a', true, rootNode ) &&
			closest( event.target, '.reader__x-post', true, rootNode )
		) {
			return;
		}

		// if the click has modifier, ignore it
		if ( event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) {
			// some child handled it
			event.preventDefault();
			this.props.handleClick( this.props.xMetadata );
		}
	};

	getSiteNameFromURL = siteURL => {
		return siteURL && `+${ url.parse( siteURL ).hostname.split( '.' )[ 0 ] }`;
	};

	getDescription = authorFirstName => {
		let label;
		const siteName = this.getSiteNameFromURL( this.props.xMetadata.siteURL );
		const isCrossComment = !! this.props.xMetadata.commentURL;
		if ( isCrossComment ) {
			label = this.props.translate(
				'{{author}}%(authorFirstName)s{{/author}} {{label}}left a comment on %(siteName)s, cross-posted to{{/label}} {{blogNames/}}',
				{
					args: {
						siteName: siteName,
						authorFirstName: authorFirstName,
					},
					components: {
						author: <span className="reader__x-post-author" />,
						label: <span className="reader__x-post-label" />,
						blogNames: this.getXPostedToContent(),
					},
				}
			);
		} else {
			label = this.props.translate(
				'{{author}}%(authorFirstName)s{{/author}} {{label}}cross-posted from %(siteName)s to{{/label}} {{blogNames/}}',
				{
					args: {
						siteName: siteName,
						authorFirstName: authorFirstName,
					},
					components: {
						author: <span className="reader__x-post-author" />,
						label: <span className="reader__x-post-label" />,
						blogNames: this.getXPostedToContent(),
					},
				}
			);
		}
		return label;
	};

	getXPostedToContent = () => {
		let xPostedToList = this.props.xPostedTo;
		if ( ! xPostedToList || xPostedToList.length === 0 ) {
			xPostedToList = [
				{
					siteURL: this.props.post.site_URL,
					siteName: this.getSiteNameFromURL( this.props.post.site_URL ),
				},
			];
		}
		return xPostedToList.map( ( xPostedTo, index, array ) => {
			return (
				<span className="reader__x-post-site" key={ xPostedTo.siteURL + '-' + index }>
					{ xPostedTo.siteName }
					{ index + 2 < array.length && <span>, </span> }
					{ index + 2 === array.length && (
						<span>
							{' '}
							{ this.props.translate( 'and', {
								comment:
									'last conjunction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4',
							} ) }{' '}
						</span>
					) }
				</span>
			);
		} );
	};

	render() {
		const { post, postKey, site, feed, translate } = this.props;
		const { blogId: siteId, feedId } = postKey;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );

		const articleClasses = classnames( {
			reader__card: true,
			'is-x-post': true,
			'is-selected': this.props.isSelected,
		} );

		// Remove the x-post text from the title.
		// TODO: maybe add xpost metadata, so we can remove this regex
		let xpostTitle = post.title;
		xpostTitle = xpostTitle.replace( /x-post:/i, '' );

		if ( ! xpostTitle ) {
			xpostTitle = `(${ translate( 'no title' ) })`;
		}

		return (
			<Card tagName="article" onClick={ this.handleCardClick } className={ articleClasses }>
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ post.author }
					onClick={ this.handleTitleClick }
					isCompact={ true }
				/>
				<div className="reader__x-post">
					{ post.title && (
						<h1 className="reader__post-title">
							<a
								className="reader__post-title-link"
								onClick={ this.handleTitleClick }
								href={ post.URL }
								target="_blank"
								rel="noopener noreferrer"
							>
								<Emojify>{ xpostTitle }</Emojify>
							</a>
						</h1>
					) }
					<Emojify>{ this.getDescription( post.author.first_name ) }</Emojify>
				</div>
				{ feedId && <QueryReaderFeed feedId={ +feedId } includeMeta={ false } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
			</Card>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { feedId, blogId } = ownProps.postKey;
	let feed, site;
	if ( feedId ) {
		feed = getFeed( state, feedId );
		site = feed && feed.blog_ID ? getSite( state, feed.blog_ID ) : undefined;
	} else {
		site = getSite( state, blogId );
		feed = site && site.feed_ID ? getFeed( state, site.feed_ID ) : undefined;
	}
	return {
		feed,
		site,
	};
} )( localize( CrossPost ) );
