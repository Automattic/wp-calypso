import page from '@automattic/calypso-router';
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

interface PrimaryBlogCardProps {
	primaryBlogId: number;
	displayName?: string;
	closeCard: () => void;
}

function PrimaryBlogCard( {
	primaryBlogId,
	displayName,
	closeCard,
}: PrimaryBlogCardProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) ) as SiteDetails;
	const primaryBlogUrl = site?.URL;

	if ( ! primaryBlogUrl ) {
		return <QueryReaderSite siteId={ primaryBlogId } />;
	}

	const linkUrl = getStreamUrl( site?.feed_ID, primaryBlogId );

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
				<div className="gravatar-hovercard__primary-blog-card">
					<a
						href={ linkUrl }
						onClick={ ( e ) => {
							e.preventDefault();
							closeCard();
							page( linkUrl );
						} }
					>
						<div className="gravatar-hovercard__primary-blog-card-header">
							<SiteIcon iconUrl={ site?.icon?.img || site?.icon?.ico } size={ 40 } />
							<div className="gravatar-hovercard__primary-blog-card-site-info">
								<h5 className="gravatar-hovercard__primary-blog-card-site-title">{ site.title }</h5>

								{ displayName && (
									<p className="gravatar-hovercard__primary-blog-card-username">
										{ translate( 'By %(displayName)s', {
											args: {
												displayName: displayName || '',
											},
										} ) }
									</p>
								) }
							</div>
						</div>
					</a>

					<p className="gravatar-hovercard__primary-blog-card-description">{ site?.description }</p>

					<ReaderFollowButton
						className="gravatar-hovercard__primary-blog-card-follow-button"
						siteUrl={ primaryBlogUrl }
						hasButtonStyle
						followSource="gravatar-hovercard__primary-blog-card"
						onFollowToggle={ onFollowToggle }
					/>
				</div>
			</AutoDirection>
		</>
	);
}

export default PrimaryBlogCard;
