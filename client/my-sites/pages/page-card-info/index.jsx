import { Gridicon } from '@automattic/components';
import { getThemeIdFromStylesheet } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import PostRelativeTimeStatus from 'calypso/my-sites/post-relative-time-status';
import { isFrontPage, isPostsPage } from 'calypso/state/pages/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getTheme } from 'calypso/state/themes/selectors';

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

const getThemeId = ( page ) => {
	return getThemeIdFromStylesheet(
		page?.metadata?.find( ( { key } ) => key === '_tft_homepage_template' )?.value
	);
};

const ICON_SIZE = 12;

export const PageCardInfoBadge = ( { icon, text } ) => (
	<span className="page-card-info__badge">
		<Gridicon icon={ icon } size={ ICON_SIZE } className="page-card-info__badge-icon" />
		<span className="page-card-info__badge-text">{ text }</span>
	</span>
);

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
						includeBasicStatus
					/>
				) }
				{ isFront && <PageCardInfoBadge icon="house" text={ translate( 'Homepage' ) } /> }
				{ isPosts && <PageCardInfoBadge icon="posts" text={ translate( 'Your latest posts' ) } /> }
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
	const themeId = getThemeId( props.page );

	return {
		isFront: isFrontPage( state, props.page.site_ID, props.page.ID ),
		isPosts: isPostsPage( state, props.page.site_ID, props.page.ID ),
		theme: themeId && getTheme( state, 'wpcom', themeId ),
		themeId,
		contentLink: getContentLink( state, props.page.site_ID, props.page ),
	};
} )( PageCardInfo );
