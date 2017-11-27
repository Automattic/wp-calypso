/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
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

function PostTotalViews( {
	clickHandler,
	icon,
	numberFormat,
	post,
	size,
	slug,
	translate,
	viewCount,
} ) {
	const { ID: postId, site_ID: siteId } = post;
	let viewsCountDisplay = '',
		viewsTitle;

	if ( viewCount ) {
		viewsCountDisplay = numberFormat( viewCount );
		viewsTitle = translate( '%(count)s Total View', '%(count)s Total Views', {
			count: viewCount,
			args: {
				count: viewCount,
			},
		} );
	} else {
		viewsTitle = translate( 'Total Views' );
	}

	if ( ! slug ) {
		return <QuerySites siteId={ siteId } />;
	}

	return (
		<a
			href={ `/stats/post/${ postId }/${ slug }` }
			className={ classNames( {
				'post__total-views': true,
				'is-empty': ! viewsCountDisplay,
			} ) }
			title={ viewsTitle }
			onClick={ clickHandler }
		>
			<QueryPostStats siteId={ siteId } postId={ postId } fields={ [ 'views' ] } />
			<Gridicon icon={ icon } size={ size } />
			<StatUpdateIndicator updateOn={ viewsCountDisplay }>
				{ viewsCountDisplay }
			</StatUpdateIndicator>
		</a>
	);
}

PostTotalViews.propTypes = {
	clickHandler: PropTypes.func,
	icon: PropTypes.string,
	numberFormat: PropTypes.func,
	post: PropTypes.object.isRequired,
	size: PropTypes.number,
	slug: PropTypes.string,
	translate: PropTypes.func,
	viewCount: PropTypes.number,
};

PostTotalViews.defaultProps = {
	icon: 'visible',
	size: 24,
};

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const viewCount = getPostStat( state, post.site_ID, post.ID, 'views' );

	return {
		slug: getSiteSlug( state, post.site_ID ),
		viewCount,
	};
} )( localize( PostTotalViews ) );
