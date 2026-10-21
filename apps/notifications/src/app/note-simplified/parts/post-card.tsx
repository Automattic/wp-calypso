import { __experimentalText as Text } from '@wordpress/components';
import { useAppContext } from '../../context';
import { formatDate } from '../format-note-time';
import LinkCard from './link-card';
import SiteIdentity from './site-identity';
import type { NotePost, NoteSite } from '../../types';

export default function PostCard( { post, site }: { post: NotePost; site?: NoteSite } ) {
	const { locale } = useAppContext();
	const byline = [ post.author_name, post.date && formatDate( post.date, locale ) ]
		.filter( Boolean )
		.join( ' · ' );

	const title = (
		<Text size={ 15 } weight={ 600 } lineHeight="24px" truncate numberOfLines={ 1 }>
			{ post.title }
		</Text>
	);

	if ( ! site ) {
		return <LinkCard href={ post.url } header={ title } />;
	}

	return (
		<LinkCard href={ post.url } header={ <SiteIdentity site={ site } details={ byline } /> }>
			{ title }
		</LinkCard>
	);
}
