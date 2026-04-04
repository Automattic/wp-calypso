import './styles.scss';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { UserHovercardResponse } from '../queries/use-user-hovercard-query';

interface PrimaryBlogCardProps {
	user: UserHovercardResponse[ 'user' ];
	primaryBlog: UserHovercardResponse[ 'primary_blog' ];
}

function PrimaryBlogCard( { user, primaryBlog }: PrimaryBlogCardProps ): JSX.Element | null {
	const translate = useTranslate();
	const dispatch = useDispatch();

	if ( ! primaryBlog ) {
		return null;
	}

	const name =
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
			<QueryReaderSite siteId={ primaryBlog.ID } />
			<AutoDirection>
				<div className="user-hovercard__primary-blog">
					<a className="user-hovercard__primary-blog-link" href={ siteUrl }>
						<div className="user-hovercard__primary-blog-header">
							<SiteIcon iconUrl={ primaryBlog.avatar_URL } size={ 40 } />

							<div className="user-hovercard__primary-blog-site-info">
								<h5>{ primaryBlog.title }</h5>
								{ name && <p> { translate( 'By %(name)s', { args: { name } } ) } </p> }
							</div>
						</div>

						{ primaryBlog.description && (
							<p className="user-hovercard__primary-blog-description">
								{ primaryBlog.description }
							</p>
						) }
					</a>

					<ReaderFollowButton
						className="user-hovercard__primary-blog-follow-button"
						siteUrl={ primaryBlog.URL }
						iconSize={ 26 }
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
