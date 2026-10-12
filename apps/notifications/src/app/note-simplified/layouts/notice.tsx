import { getContext, namesSite } from '../data/context';
import { getAvatars, getFollow, getPersonSite, hasHeadline, hasSinglePerson } from '../data/person';
import { getWhatHappened, getSiteHost, getItem } from '../data/sentence';
import Body from '../parts/body';
import Context from '../parts/context';
import Headline from '../parts/headline';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { Note } from '../../types';

export default function NoticeNote( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const context = getContext( note );
	const site = namesSite( context ) ? undefined : getSiteHost( note );

	return (
		<>
			{ hasHeadline( note ) && (
				<Headline
					note={ note }
					whatHappened={ getWhatHappened( note ) }
					// Whatever is shown beneath already names the thing.
					item={ context ? undefined : getItem( note ) }
					avatars={ getAvatars( note ) }
					site={ isPendingApproval ? getPersonSite( note ) : site }
					follow={ getFollow( note ) }
				/>
			) }
			<Context context={ context } />
			<Body
				note={ note }
				hidePeople={ hasSinglePerson( note ) }
				hidePost={ context?.kind === 'post' && !! context.post }
			/>
		</>
	);
}
