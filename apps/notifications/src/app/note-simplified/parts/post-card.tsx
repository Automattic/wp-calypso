import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../context';
import { formatNoteTime } from '../format-note-time';
import Author from './author';
import LinkCard from './link-card';
import MetaList from './meta-list';
import SiteIdentity from './site-identity';
import type { NotePost, NoteSite } from '../../types';

/**
 * The post a note happened on, linking to it.
 */
export default function PostCard( { post, site }: { post: NotePost; site?: NoteSite } ) {
	const { locale } = useAppContext();
	const title = post.title || __( 'No title' );

	if ( ! site ) {
		return (
			<LinkCard
				card="post"
				href={ post.url }
				header={
					<Text size={ 14 } weight={ 600 } lineHeight="24px" truncate numberOfLines={ 1 }>
						{ title }
					</Text>
				}
			/>
		);
	}

	// The post's title leads, with its author and date below it, the date in the same
	// format as the rest of the note's.
	const details = (
		<MetaList>
			{ post.author_name && (
				<Author avatar={ post.author_avatar }>
					<span className="wpnc-simplified__card-author">{ post.author_name }</span>
				</Author>
			) }
			{ post.date && formatNoteTime( post.date, locale ) }
		</MetaList>
	);

	return (
		<LinkCard
			card="post"
			href={ post.url }
			header={ <SiteIdentity site={ site } title={ title } details={ details } /> }
		/>
	);
}
