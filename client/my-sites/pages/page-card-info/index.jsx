/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { isFrontPage, isPostsPage } from 'state/pages/selectors';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import { canCurrentUser } from 'state/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

const getContentLink = ( state, siteId, page ) => {
	let contentLinkURL = page.URL;
	let contentLinkTarget = '_blank';

	if ( canCurrentUser( state, siteId, 'edit_pages' ) && page.status !== 'trash' ) {
		contentLinkURL = getEditorPath( state, siteId, page.ID );
		contentLinkTarget = null;
	} else if ( page.status === 'trash' ) {
		contentLinkURL = null;
	}

	return { contentLinkURL, contentLinkTarget };
};

function PageCardInfo( {
	translate,
	moment,
	page,
	showTimestamp,
	isFront,
	isPosts,
	siteUrl,
	contentLink,
} ) {
	const iconSize = 12;
	const renderFutureTimestamp = function() {
		if ( page.status === 'future' ) {
			return (
				<PostRelativeTimeStatus
					post={ page }
					link={ contentLink.contentLinkURL }
					target={ contentLink.contentLinkTarget }
					gridiconSize={ iconSize }
				/>
			);
		}

		return null;
	};

	return (
		<div className="page-card-info">
			{ siteUrl && <div className="page-card-info__site-url">{ siteUrl }</div> }
			<div>
				{ showTimestamp &&
					( renderFutureTimestamp() || (
						<span className="page-card-info__item">
							<Gridicon icon="time" size={ iconSize } className="page-card-info__item-icon" />
							<span className="page-card-info__item-text">
								{ moment( page.modified ).fromNow() }
							</span>
						</span>
					) ) }
				{ isFront && (
					<span className="page-card-info__item">
						<Gridicon icon="house" size={ iconSize } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">{ translate( 'Front page' ) }</span>
					</span>
				) }
				{ isPosts && (
					<span className="page-card-info__item">
						<Gridicon icon="posts" size={ iconSize } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">{ translate( 'Your latest posts' ) }</span>
					</span>
				) }
			</div>
		</div>
	);
}

export default connect( ( state, props ) => {
	return {
		isFront: isFrontPage( state, props.page.site_ID, props.page.ID ),
		isPosts: isPostsPage( state, props.page.site_ID, props.page.ID ),
		contentLink: getContentLink( state, props.page.site_ID, props.page ),
	};
} )( localize( PageCardInfo ) );
