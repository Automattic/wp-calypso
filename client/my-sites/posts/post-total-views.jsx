/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StatUpdateIndicator from 'components/stat-update-indicator';
import Gridicon from 'components/gridicon';
import sitesList from 'lib/sites-list';
import QueryPostStats from 'components/data/query-post-stats';
import { getPostStat } from 'state/stats/posts/selectors';

const sites = sitesList();

var PostTotalViews = React.createClass( {

	propTypes: {
		post: PropTypes.object.isRequired,
		viewCount: PropTypes.number,
		clickHandler: PropTypes.func
	},

	render() {
		const { viewCount, post } = this.props,
			postId = post.ID,
			siteId = post.site_ID;
		let viewsCountDisplay = '',
			viewsTitle;

		if ( viewCount && ! isNaN( viewCount ) ) {
			viewsCountDisplay = this.numberFormat( viewCount );
			viewsTitle = this.translate( '1 Total View', '%(count)s Total Views', {
				count: viewCount,
				args: {
					count: viewCount
				}
			} );
		} else {
			viewsTitle = this.translate( 'Total Views' );
		}

		const site = sites.getSite( siteId );

		return (
			<a href={ `/stats/post/${postId}/${site.slug}` }
				className={ classNames( {
					'post__total-views': true,
					'is-empty': ! viewsCountDisplay
				} ) }
				title={ viewsTitle }
				onClick={ this.props.clickHandler }>
				<QueryPostStats siteId= { siteId } postId={ postId } stat="views" />
				<Gridicon icon="visible" size={ 24 } />
				<StatUpdateIndicator updateOn={ viewsCountDisplay }>{ viewsCountDisplay }</StatUpdateIndicator>
			</a>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const viewCount = getPostStat( state, 'views', post.site_ID, post.ID );

	return {
		viewCount
	};
} )( PostTotalViews );
