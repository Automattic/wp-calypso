/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import StatUpdateIndicator from 'components/stat-update-indicator';
import QueryPostStats from 'components/data/query-post-stats';
import QuerySites from 'components/data/query-sites';
import { getPostStat } from 'state/stats/posts/selectors';
import { getSiteSlug } from 'state/sites/selectors';

function PostTotalViews( { clickHandler, numberFormat, post, slug, translate, viewCount } ) {
	const { ID: postId, site_ID: siteId } = post;
	let viewsCountDisplay = '',
		viewsTitle;

	if ( viewCount ) {
		viewsCountDisplay = numberFormat( viewCount );
		viewsTitle = translate( '%(count)s Total View', '%(count)s Total Views', {
			count: viewCount,
			args: {
				count: viewCount
			}
		} );
	} else {
		viewsTitle = translate( 'Total Views' );
	}

	if ( ! slug ) {
		return <QuerySites siteId={ siteId } />;
	}

	return (
		<a href={ `/stats/post/${ postId }/${ slug }` }
			className={ classNames( {
				'post__total-views': true,
				'is-empty': ! viewsCountDisplay
			} ) }
			title={ viewsTitle }
			onClick={ clickHandler }>
			<QueryPostStats siteId= { siteId } postId={ postId } fields={ [ 'views' ] } />
			<Gridicon icon="visible" size={ 24 } />
			<StatUpdateIndicator updateOn={ viewsCountDisplay }>{ viewsCountDisplay }</StatUpdateIndicator>
		</a>
	);
}

PostTotalViews.propTypes = {
	clickHandler: PropTypes.func,
	numberFormat: PropTypes.func,
	post: PropTypes.object.isRequired,
	slug: PropTypes.string,
	translate: PropTypes.func,
	viewCount: PropTypes.number
};

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const viewCount = getPostStat( state, post.site_ID, post.ID, 'views' );

	return {
		slug: getSiteSlug( state, post.site_ID ),
		viewCount
	};
} )( localize( PostTotalViews ) );
