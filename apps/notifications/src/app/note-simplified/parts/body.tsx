import clsx from 'clsx';
import { useMemo } from 'react';
import { zipWithSignature } from '../../../panel/templates/functions';
import { NoteBody } from '../../templates/body';
import type { BlockWithSignature, Note } from '../../types';

export default function Body( {
	note,
	hidePeople = false,
	hidePost = false,
}: {
	note: Note;
	hidePeople?: boolean;
	hidePost?: boolean;
} ) {
	// Stable, since the body's effects (the reply lookup among them) depend on the note.
	const bodyNote = useMemo(
		() => ( {
			...note,
			body: ( zipWithSignature( note.body, note ) as BlockWithSignature[] )
				.filter(
					( { signature: { type } } ) =>
						! ( hidePeople && type === 'user' ) && ! ( hidePost && type === 'post' )
				)
				.map( ( { block } ) => block ),
		} ),
		[ note, hidePeople, hidePost ]
	);

	return (
		// Every type class but the comment's, which would bring in the detailed layout's
		// comment bar.
		<div
			className={ clsx( 'wpnc__note', { [ `wpnc__${ note.type }` ]: note.type !== 'comment' } ) }
		>
			<NoteBody note={ bodyNote } hidePendingApproval />
		</div>
	);
}
