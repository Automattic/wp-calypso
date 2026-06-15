import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

/**
 * Validate `profileUrl` as an https web URL and split out the hostname for
 * the link label. Returns `null` when the URL is missing, malformed, or
 * uses a non-https scheme — in that case the calling component should
 * render nothing (rather than a broken anchor with a `#` href).
 */
function safeProfileUrl(
	profileUrl: string | null | undefined
): { href: string; host: string } | null {
	if ( ! profileUrl ) {
		return null;
	}
	try {
		const parsed = new URL( profileUrl );
		if ( parsed.protocol !== 'https:' ) {
			return null;
		}
		return { href: parsed.href, host: parsed.host };
	} catch {
		return null;
	}
}

/**
 * Rendered in place of the followers / following list when the upstream
 * Mastodon profile reports `hide_collections: true`. Mirrors the message
 * mas.to (and other Mastodon UIs) show in the same situation so users get
 * a consistent explanation across surfaces.
 */
export function HiddenCollectionsMessage() {
	const translate = useTranslate();
	return (
		<EmptyContent
			title={ String(
				translate( 'This user has chosen to not make this information available.' )
			) }
		/>
	);
}

interface PartialCollectionsNoticeProps {
	profileUrl: string | null | undefined;
	mode: 'followers' | 'following';
}

/**
 * Footer rendered below the followers / following list when collections
 * are visible. The home-instance API only returns the locally-known
 * subset of follow relationships for remote actors, so the totals on the
 * actor's home instance can be much higher. The link sends the user to
 * the source-of-truth list.
 */
export function PartialCollectionsNotice( { profileUrl, mode }: PartialCollectionsNoticeProps ) {
	const translate = useTranslate();
	const link = safeProfileUrl( profileUrl );
	if ( ! link ) {
		return null;
	}

	// One full translatable sentence per mode so translators see (and can
	// reorder) the assembled string. `children` is provided by the
	// i18n-calypso substitution; passing `null` here satisfies the typed
	// required prop on `ExternalLink` without overriding the substituted
	// text.
	const options = {
		args: { host: link.host },
		components: {
			externalLink: (
				<ExternalLink
					className="mastodon-profile-collections-notice__link"
					href={ link.href }
					children={ null }
				/>
			),
		},
	};
	const message =
		mode === 'followers'
			? translate(
					'Followers for this profile may be missing. See more on {{externalLink}}%(host)s{{/externalLink}}.',
					options
			  )
			: translate(
					'Accounts followed by this profile may be missing. See more on {{externalLink}}%(host)s{{/externalLink}}.',
					options
			  );

	return <p className="mastodon-profile-collections-notice">{ message }</p>;
}
