/** @format */
/**
 * External Dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { zip } from 'lodash';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import page from 'page';
import { getSourceData as getDiscoverSourceData } from 'reader/discover/helper';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import cssSafeUrl from 'lib/css-safe-url';
import QueryReaderPost from 'components/data/query-reader-post';
import { getPostsByKeys } from 'state/reader/posts/selectors';
import { getReaderStream as getStream } from 'state/selectors';
import { requestPage } from 'state/reader/streams/actions';

function getPostUrl( post ) {
	return '/read/blogs/' + post.site_ID + '/posts/' + post.ID;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
class FeedFeatured extends React.PureComponent {
	static displayName = 'FeedFeatured';

	componentDidMount() {
		this.props.requestPage( { streamKey: this.props.streamKey } );
	}

	handleClick = postData => {
		const post = postData.post;
		recordTrackForPost( 'calypso_reader_clicked_featured_post', post );
		recordAction( 'clicked_featured_post' );
		recordGaEvent( 'Clicked Featured Post' );

		page( postData.url );
	};

	renderPosts = () => {
		const { posts, sources } = this.props;
		return zip( posts, sources ).map( ( [ post, source ] ) => {
			const url = getPostUrl( source || post );
			const postData = { post, source, url };
			const postState = post._state;

			switch ( postState ) {
				case 'minimal':
				case 'pending':
				case 'error':
					break;
				default:
					const style = {
						backgroundImage:
							post.canonical_image && post.canonical_image.uri
								? 'url(' + cssSafeUrl( post.canonical_image.uri ) + ')'
								: null,
					};

					return (
						<div
							key={ post.ID }
							className="reader__featured-post"
							onClick={ this.handleClick.bind( this, postData ) }
						>
							<div className="reader__featured-post-image" style={ style } />
							<h2 className="reader__featured-post-title">{ post.title }</h2>
						</div>
					);
			}
		} );
	};

	render() {
		const { posts, translate, stream } = this.props;
		if ( ! posts ) {
			return (
				<Fragment>
					{ stream.items.map( postKey => <QueryReaderPost postKey={ postKey } /> ) }
				</Fragment>
			);
		}

		return (
			<Card className="reader__featured-card">
				<div className="reader__featured-header">
					<div className="reader__featured-title">{ translate( 'Highlights' ) }</div>
					<div className="reader__featured-description">
						{ translate( 'What we’re reading this week.' ) }
					</div>
				</div>

				<div className="reader__featured-posts">{ this.renderPosts() }</div>
			</Card>
		);
	}
}

function mapStateToProps( state, { streamKey } ) {
	const stream = getStream( state, streamKey );
	const postKeys = stream.items;
	const posts = getPostsByKeys( state, postKeys );

	const sourcePostKeys = posts.map( getDiscoverSourceData );
	const sources = getPostsByKeys( state, sourcePostKeys );

	return { posts, sources, stream };
}

export default connect( mapStateToProps, { requestPage } )( localize( FeedFeatured ) );
