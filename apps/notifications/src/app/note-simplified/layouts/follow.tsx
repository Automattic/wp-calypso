import SiteCard from '../parts/site-card';
import ReactionsNote from './reactions';
import type { Note } from '../../types';

export default function FollowNote( { note }: { note: Note } ) {
	const siteBlock = note.header?.[ 0 ];
	const siteUrl = siteBlock?.ranges?.[ 0 ]?.url;

	return (
		<>
			{ siteBlock?.text && siteUrl && (
				<SiteCard
					site={ { name: siteBlock.text, icon: siteBlock.media?.[ 0 ]?.url ?? '' } }
					url={ siteUrl }
				/>
			) }
			<ReactionsNote note={ note } />
		</>
	);
}
