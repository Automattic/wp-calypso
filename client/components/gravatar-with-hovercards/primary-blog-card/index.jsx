import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/reader/sites/selectors';

function PrimaryBlog( { primaryBlogId, displayName, closeCard } ) {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) );
	const primaryBlogUrl = site?.URL;

	if ( ! primaryBlogUrl ) {
		return <QueryReaderSite siteId={ primaryBlogId } />;
	}

	const linkUrl = site?.feed_ID ? `/reader/feeds/${ site?.feed_ID }` : primaryBlogUrl;

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
							<ReaderAvatar
								isCompact
								siteIcon={ site?.icon?.img || site?.icon?.ico }
								className="gravatar-hovercard__primary-blog-card-site-icon"
							/>
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
					/>
				</div>
			</AutoDirection>
		</>
	);
}

export default PrimaryBlog;
