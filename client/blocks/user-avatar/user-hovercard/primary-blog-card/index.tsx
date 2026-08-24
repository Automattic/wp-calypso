import './styles.scss';
import { UserResponse } from '@automattic/api-core';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import { decodeEntities } from 'calypso/lib/formatting';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import type { JSX } from 'react';

interface PrimaryBlogCardProps {
	user: UserResponse;
}

function PrimaryBlogCard( { user }: PrimaryBlogCardProps ): JSX.Element | null {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const primaryBlog = user.primary_blog;
	if ( ! primaryBlog ) {
		return null;
	}

	const name: string =
		user.display_name ||
		( user.first_name && user.last_name ? `${ user.first_name } ${ user.last_name }` : '' ) ||
		user.nice_name ||
		'';
	const siteUrl = getStreamUrl( primaryBlog.feed_ID, primaryBlog.ID );

	const onFollowToggle = ( following: boolean ): void => {
		const siteName = primaryBlog.title || primaryBlog.URL;

		dispatch(
			successNotice(
				following
					? translate( 'Success! You are now subscribed to "%s".', { args: siteName } )
					: translate( 'Success! You are now unsubscribed from "%s".', { args: siteName } ),
				{ duration: 3000 }
			)
		);
	};

	return (
		<>
			<AutoDirection>
				<div className="user-hovercard__primary-blog">
					<a className="user-hovercard__primary-blog-link" href={ siteUrl }>
						<div className="user-hovercard__primary-blog-header">
							<SiteIcon iconUrl={ primaryBlog.avatar_URL } size={ 40 } />

							<div className="user-hovercard__primary-blog-site-info">
								<h5>{ decodeEntities( primaryBlog.title ) }</h5>
								{ name && <p> { translate( 'by %(name)s', { args: { name } } ) } </p> }
							</div>
						</div>

						{ primaryBlog.description && (
							<p className="user-hovercard__primary-blog-description">
								{ decodeEntities( primaryBlog.description ) }
							</p>
						) }
					</a>

					<ReaderFollowButton
						className="user-hovercard__primary-blog-follow-button"
						siteUrl={ primaryBlog.URL }
						feedId={ primaryBlog.feed_ID }
						siteId={ primaryBlog.ID }
						iconSize={ 24 }
						followSource="user-hovercard__primary-blog"
						onFollowToggle={ onFollowToggle }
						hasButtonStyle
					/>
				</div>
			</AutoDirection>
		</>
	);
}

export default PrimaryBlogCard;
