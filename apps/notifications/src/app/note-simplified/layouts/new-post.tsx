import { __experimentalText as Text } from '@wordpress/components';
import { getPersonSite, getAvatars, getFollow, hasHeadline, hasSinglePerson } from '../data/person';
import { getWhatHappened, getSiteHost, getItem } from '../data/sentence';
import Body from '../parts/body';
import Headline from '../parts/headline';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { Note } from '../../types';

export default function NewPostNote( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const title = note.meta?.post?.title || getItem( note )?.title;

	return (
		<>
			{ hasHeadline( note ) && (
				<Headline
					note={ note }
					whatHappened={ getWhatHappened( note ) }
					avatars={ getAvatars( note ) }
					site={ isPendingApproval ? getPersonSite( note ) : getSiteHost( note ) }
					follow={ getFollow( note ) }
				/>
			) }
			{ title && (
				<Text className="wpnc-simplified__quiet-links" size={ 15 } weight={ 600 }>
					<a href={ note.meta?.post?.url ?? note.url } target="_blank" rel="noreferrer">
						{ title }
					</a>
				</Text>
			) }
			<Body note={ note } hidePeople={ hasSinglePerson( note ) } />
		</>
	);
}
