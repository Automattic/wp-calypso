import clsx from 'clsx';
import { useMemo } from 'react';
import { NoteBody } from '../../templates/body';
import { getBlocksWithout } from '../data/blocks';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { Note } from '../../types';

/** The note's own blocks, minus those the layout above already shows. */
export default function Body( {
	note,
	hidePeople = false,
	hidePost = false,
	hidePendingApproval = false,
}: {
	note: Note;
	hidePeople?: boolean;
	hidePost?: boolean;
	hidePendingApproval?: boolean;
} ) {
	const isPendingApproval = useIsPendingApproval( note );
	// Stable, since the body's effects (the reply lookup among them) depend on the note.
	const bodyNote = useMemo(
		() => ( {
			...note,
			body: getBlocksWithout( note, [
				...( hidePeople ? ( [ 'user' ] as const ) : [] ),
				...( hidePost ? ( [ 'post' ] as const ) : [] ),
			] ),
		} ),
		[ note, hidePeople, hidePost ]
	);

	return (
		// Every type class but the comment's, which would bring in the detailed layout's
		// comment bar.
		<div
			className={ clsx( 'wpnc__note', {
				[ `wpnc__${ note.type }` ]: note.type !== 'comment',
				'wpnc__comment-unapproved': isPendingApproval && ! hidePendingApproval,
			} ) }
		>
			<NoteBody note={ bodyNote } hidePendingApproval={ hidePendingApproval } />
		</div>
	);
}
