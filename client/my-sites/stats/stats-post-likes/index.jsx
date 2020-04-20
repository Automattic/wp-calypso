/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Count from 'components/count';
import StatsModuleContent from '../stats-module/content-text';
import QueryPostLikes from 'components/data/query-post-likes';
import StatsModulePlaceholder from '../stats-module/placeholder';
import toggleInfo from '../toggle-info';
import countPostLikes from 'state/selectors/count-post-likes';
import PostLikes from 'blocks/post-likes';

/**
 * Style dependencies
 */
import './style.scss';

export const StatsPostLikes = ( props ) => {
	const { countLikes, opened, postId, postType, siteId, toggle, translate } = props;
	const infoIcon = opened ? 'info' : 'info-outline';
	const isLoading = countLikes === null;
	const classes = {
		'is-showing-info': opened,
		'is-loading': isLoading,
	};

	let likesListLabel, likesTitleLabel;

	if ( postType === 'page' ) {
		likesTitleLabel = translate( 'Page Likes' );
		likesListLabel = translate( 'This panel shows the list of people who like your page.' );
	} else {
		likesTitleLabel = translate( 'Post Likes' );
		likesListLabel = translate( 'This panel shows the list of people who like your post.' );
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
	return (
		<Card className={ classNames( 'stats-module', 'stats-post-likes', 'is-expanded', classes ) }>
			<QueryPostLikes siteId={ siteId } postId={ postId } />
			<div className="module-header">
				<h4 className="module-header-title">
					{ likesTitleLabel }
					{ countLikes !== null && <Count count={ countLikes } /> }
				</h4>
				<ul className="module-header-actions">
					<li className="module-header-action toggle-info">
						<a
							href="#"
							className="module-header-action-link"
							aria-label={ translate( 'Show or hide panel information', {
								textOnly: true,
								context: 'Stats panel action',
							} ) }
							title={ translate( 'Show or hide panel information', {
								textOnly: true,
								context: 'Stats panel action',
							} ) }
							onClick={ toggle }
						>
							<Gridicon icon={ infoIcon } />
						</a>
					</li>
				</ul>
			</div>
			<StatsModuleContent className="module-content-text-info">
				{ likesListLabel }
			</StatsModuleContent>
			<StatsModulePlaceholder isLoading={ isLoading } />
			<div className="stats-post-likes__content">
				<PostLikes siteId={ siteId } postId={ postId } postType={ postType } />
			</div>
		</Card>
	);
};

StatsPostLikes.defaultProps = {
	postType: 'post',
};

const connectComponent = connect( ( state, { siteId, postId } ) => {
	const countLikes = countPostLikes( state, siteId, postId );
	return {
		countLikes,
	};
} );

export default flowRight( connectComponent, toggleInfo, localize )( StatsPostLikes );
