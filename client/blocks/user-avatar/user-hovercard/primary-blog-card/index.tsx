import './styles.scss';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { UserAvatarInfo } from '../..';

interface PrimaryBlogCardProps {
	primaryBlogId: number;
	user: UserAvatarInfo;
}

function PrimaryBlogCard( { user, primaryBlogId }: PrimaryBlogCardProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) ) as SiteDetails;
	const primaryBlogUrl = site?.URL;
	const name = user?.display_name || user?.name || '';
	const siteUrl = getStreamUrl( site?.feed_ID, primaryBlogId );

	if ( ! primaryBlogUrl ) {
		return <QueryReaderSite siteId={ primaryBlogId } />;
	}

	const onFollowToggle = ( following: boolean ): void => {
		const siteName = site?.title || site?.URL;

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
			<QueryReaderSite siteId={ primaryBlogId } />
			<AutoDirection>
				<div className="user-hovercard__primary-blog">
					<a className="user-hovercard__primary-blog-link" href={ siteUrl }>
						<div className="user-hovercard__primary-blog-header">
							<SiteIcon iconUrl={ site?.icon?.img || site?.icon?.ico } size={ 40 } />

							<div className="user-hovercard__primary-blog-site-info">
								<h5>{ site.title }</h5>
								{ name && <p> { translate( 'By %(name)s', { args: { name } } ) } </p> }
							</div>
						</div>

						{ site?.description && (
							<p className="user-hovercard__primary-blog-description">{ site?.description }</p>
						) }
					</a>

					<ReaderFollowButton
						className="user-hovercard__primary-blog-follow-button"
						siteUrl={ primaryBlogUrl }
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
