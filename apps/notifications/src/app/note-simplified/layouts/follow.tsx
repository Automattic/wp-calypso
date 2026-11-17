import SiteCard, { getHeaderSite } from '../parts/site-card';
import ReactionsNote from './reactions';
import type { Note } from '../../types';

export default function FollowNote( { note }: { note: Note } ) {
	const headerSite = getHeaderSite( note.header );
	const siteCard = headerSite && <SiteCard { ...headerSite } />;

	if ( 'follow' === note.type ) {
		return <ReactionsNote note={ note } header={ siteCard } />;
	}

	return (
		<>
			{ siteCard }
			<ReactionsNote note={ note } />
		</>
	);
}
