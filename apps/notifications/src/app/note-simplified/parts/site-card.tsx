import { __experimentalText as Text } from '@wordpress/components';
import LinkCard from './link-card';
import SiteIdentity from './site-identity';
import type { NoteSite, Subject } from '../../types';

type HeaderSite = {
	site: NoteSite;
	url: string;
	post?: { title: string; url: string };
};

/**
 * Returns the site named by a note's header row, with the post its second line links to,
 * or null when the row names a person.
 */
export function getHeaderSite( header?: Subject[] ): HeaderSite | null {
	const [ siteBlock, snippet ] = header ?? [];
	const range = siteBlock?.ranges?.[ 0 ];
	const isSite =
		range?.type === 'site' || ( range?.type === 'user' && Number( range.id ) === range.site_id );
	if ( ! siteBlock?.text || ! range?.url || ! isSite ) {
		return null;
	}

	const postUrl = snippet?.ranges?.find( ( snippetRange ) => snippetRange.url )?.url;

	return {
		site: { name: siteBlock.text, icon: siteBlock.media?.[ 0 ]?.url ?? '' },
		url: range.url,
		post: postUrl && snippet.text ? { title: snippet.text, url: postUrl } : undefined,
	};
}

export default function SiteCard( { site, url, post }: HeaderSite ) {
	const displayUrl = url.replace( /^https?:\/\/|\/$/g, '' );

	return (
		<LinkCard
			href={ post?.url ?? url }
			header={ <SiteIdentity site={ site } details={ displayUrl } /> }
		>
			{ post && (
				<Text size={ 15 } weight={ 600 } lineHeight="24px" truncate numberOfLines={ 1 }>
					{ post.title }
				</Text>
			) }
		</LinkCard>
	);
}
