import { useTranslate } from 'i18n-calypso';
import type { AtmosphereQuoteTombstone } from '@automattic/api-core';

interface PostCardEmbedQuoteTombstoneProps {
	tombstone: AtmosphereQuoteTombstone;
}

export function PostCardEmbedQuoteTombstone( { tombstone }: PostCardEmbedQuoteTombstoneProps ) {
	const translate = useTranslate();
	return (
		<div className="social-post-card-embed-quote-tombstone">
			{ tombstone.type === 'blocked'
				? translate( 'Quoted post is from a blocked author.' )
				: translate( 'Quoted post unavailable.' ) }
		</div>
	);
}
