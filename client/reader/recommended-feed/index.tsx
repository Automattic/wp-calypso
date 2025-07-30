import page from '@automattic/calypso-router';
import { ExternalLink } from '@wordpress/components';
import clsx from 'clsx';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/reader/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

const variantsConfig = {
	small: {
		avatarSize: 48,
	},
	default: {
		avatarSize: 30,
	},
} as const;

interface Props {
	blog: FeedRecommendation;
	classPrefix?: string;
	compact?: boolean;
	onLinkClick?: () => void;
	variant?: keyof typeof variantsConfig;
}

export const RecommendedFeed = ( {
	blog,
	classPrefix,
	compact = false,
	onLinkClick,
	variant: variantName = 'default',
}: Props ) => {
	const { image, name, feedUrl, siteId, feedId } = blog;
	const variant = variantsConfig[ variantName ];

	const site = useSelector( ( state ) => getSite( state, Number( siteId ) ) ) as SiteDetails;
	const siteIcon = site?.icon?.img || site?.icon?.ico || image;
	const linkUrl = feedId ? `/reader/feeds/${ feedId }` : feedUrl;

	const anchorProps = {
		href: linkUrl,
		onClick: ( e: { preventDefault: () => void } ) => {
			e.preventDefault();
			onLinkClick?.();
			page( linkUrl || '' );
		},
	};

	return (
		<div
			className={ clsx(
				'reader-recommended-feed',
				`${ classPrefix }__recommended-blog-item`,
				`is-${ variantName }`
			) }
		>
			{ /* Query the site not just for the icon, but to ensure it is properly loaded in follows state.
				One example being mapped domains: initial follows state may list by wpcom subdomain, and
				the url here might be of a mapped domain. The site request success also updates follows
				state, and can bridge the gap to appropriately determine if a site from this list is
				followed.
			*/ }
			<QueryReaderSite siteId={ siteId } />

			<a { ...anchorProps }>
				<ReaderAvatar
					isCompact={ compact }
					siteIcon={ siteIcon }
					iconSize={ variant.avatarSize }
					className={ `${ classPrefix }__recommended-blog-site-icon` }
				/>
			</a>
			<AutoDirection>
				<div className={ `${ classPrefix }__recommended-blog-site-info` }>
					<ExternalLink
						className={ `${ classPrefix }__recommended-blog-site-name` }
						href={ linkUrl || '' }
					>
						{ name || feedUrl }
					</ExternalLink>
					{ ! compact && site?.description && (
						<p className={ `${ classPrefix }__recommended-blog-site-description` }>
							{ site.description }
						</p>
					) }
				</div>
			</AutoDirection>

			{ feedUrl && (
				<ReaderFollowButton
					className={ `${ classPrefix }__recommended-blog-subscribe-button` }
					siteUrl={ feedUrl }
					followSource={ `${ classPrefix }__recommended-blog-item` }
					isButtonOnly={ compact }
				/>
			) }
		</div>
	);
};
