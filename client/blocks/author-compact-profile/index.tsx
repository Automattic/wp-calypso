import clsx from 'clsx';
import { useTranslate, numberFormatCompact } from 'i18n-calypso';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import AuthorCompactProfilePlaceholder from './placeholder';

import './style.scss';

interface AuthorCompactProfileProps {
	author?: Author;
	feedId?: number;
	feedIcon?: string;
	feedUrl?: string;
	followCount?: number;
	onFollowToggle?: ( isFollowing: boolean ) => void;
	post?: object;
	siteIcon?: string;
	siteId?: number;
	siteName?: string;
	siteUrl?: string;
}

interface Author {
	name: string;
	has_avatar: boolean;
}

export default function AuthorCompactProfile( props: AuthorCompactProfileProps ): JSX.Element {
	const {
		author,
		siteIcon,
		feedIcon,
		siteName,
		siteUrl,
		feedUrl,
		followCount,
		onFollowToggle,
		feedId,
		siteId,
		post,
	} = props;
	const translate = useTranslate();

	if ( ! author && ! siteName ) {
		return <AuthorCompactProfilePlaceholder />;
	}

	const hasAuthorName = author?.name;
	const hasMatchingAuthorAndSiteNames =
		hasAuthorName &&
		areEqualIgnoringWhitespaceAndCase( String( siteName ), String( author?.name ) );
	const classes = clsx( {
		'author-compact-profile': true,
		'has-author-link': ! hasMatchingAuthorAndSiteNames,
		'has-author-icon': siteIcon || feedIcon || author?.has_avatar,
	} );
	const streamUrl = getStreamUrl( feedId, siteId );

	// If we have a feed URL, use that for the follow button in preference to the site URL
	const followUrl = feedUrl || siteUrl;

	return (
		<div className={ classes }>
			<a href={ streamUrl } className="author-compact-profile__avatar-link">
				<ReaderAvatar siteIcon={ siteIcon } feedIcon={ feedIcon } author={ author || {} } />
			</a>
			<div className="author-compact-profile__names">
				{ hasAuthorName && ! hasMatchingAuthorAndSiteNames && (
					<ReaderAuthorLink author={ author } siteUrl={ streamUrl } post={ post }>
						{ author.name }
					</ReaderAuthorLink>
				) }
				{ siteName && (
					<ReaderSiteStreamLink
						className="author-compact-profile__site-link"
						feedId={ feedId }
						siteId={ siteId }
						post={ post }
					>
						{ siteName }
					</ReaderSiteStreamLink>
				) }
			</div>
			<div className="author-compact-profile__follow">
				{ followCount ? (
					<div className="author-compact-profile__follow-count">
						{ translate( '%(followCount)s subscriber', '%(followCount)s subscribers', {
							count: followCount,
							args: {
								followCount: numberFormatCompact( followCount ),
							},
						} ) }
					</div>
				) : null }

				{ followUrl && (
					<ReaderFollowButton siteUrl={ followUrl } onFollowToggle={ onFollowToggle } />
				) }
			</div>
		</div>
	);
}
