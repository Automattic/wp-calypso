/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { isFrontPage, isPostsPage } from 'state/pages/selectors';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import canCurrentUser from 'state/selectors/can-current-user';
import getEditorUrl from 'state/selectors/get-editor-url';
import PostMetadata from 'lib/post-metadata';
import { getTheme } from 'state/themes/selectors';
import QueryTheme from 'components/data/query-theme';

/**
 * Style dependencies
 */
import './style.scss';

const getContentLink = ( state, siteId, page ) => {
	let contentLinkURL = page.URL;
	let contentLinkTarget = '_blank';

	if ( canCurrentUser( state, siteId, 'edit_pages' ) && page.status !== 'trash' ) {
		contentLinkURL = getEditorUrl( state, siteId, page.ID, 'page' );
		contentLinkTarget = null;
	} else if ( page.status === 'trash' ) {
		contentLinkURL = null;
	}

	return { contentLinkURL, contentLinkTarget };
};

const ICON_SIZE = 12;

function PageCardInfo( {
	page,
	showTimestamp,
	showPublishedStatus,
	isFront,
	isPosts,
	siteUrl,
	contentLink,
	theme,
	themeId,
} ) {
	const translate = useTranslate();

	return (
		<div className="page-card-info">
			{ themeId && <QueryTheme siteId="wpcom" themeId={ themeId } /> }
			{ siteUrl && <div className="page-card-info__site-url">{ siteUrl }</div> }
			<div>
				{ showTimestamp && (
					<PostRelativeTimeStatus
						showPublishedStatus={ showPublishedStatus }
						post={ page }
						link={ contentLink.contentLinkURL }
						target={ contentLink.contentLinkTarget }
						gridiconSize={ ICON_SIZE }
						includeBasicStatus={ true }
					/>
				) }
				{ isFront && (
					<span className="page-card-info__badge">
						<Gridicon icon="house" size={ ICON_SIZE } className="page-card-info__badge-icon" />
						<span className="page-card-info__badge-text">{ translate( 'Homepage' ) }</span>
					</span>
				) }
				{ isPosts && (
					<span className="page-card-info__badge">
						<Gridicon icon="posts" size={ ICON_SIZE } className="page-card-info__badge-icon" />
						<span className="page-card-info__badge-text">{ translate( 'Your latest posts' ) }</span>
					</span>
				) }
				{ ! isFront && theme && (
					<span className="page-card-info__item">
						<Gridicon icon="themes" size={ ICON_SIZE } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">
							{ translate( '%(title)s Theme', { args: { title: theme.name } } ) }
						</span>
					</span>
				) }
			</div>
		</div>
	);
}

export default connect( ( state, props ) => {
	const themeId = PostMetadata.homepageTemplate( props.page );

	return {
		isFront: isFrontPage( state, props.page.site_ID, props.page.ID ),
		isPosts: isPostsPage( state, props.page.site_ID, props.page.ID ),
		theme: themeId && getTheme( state, 'wpcom', themeId ),
		themeId,
		contentLink: getContentLink( state, props.page.site_ID, props.page ),
	};
} )( PageCardInfo );
