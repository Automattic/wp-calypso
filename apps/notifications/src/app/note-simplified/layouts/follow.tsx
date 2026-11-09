import SiteCard, { getHeaderSite } from '../parts/site-card';
import ReactionsNote from './reactions';
import type { Note } from '../../types';

export default function FollowNote( { note }: { note: Note } ) {
	const headerSite = getHeaderSite( note.header );

	return (
		<>
			{ headerSite && <SiteCard { ...headerSite } /> }
			<ReactionsNote note={ note } />
		</>
	);
}
