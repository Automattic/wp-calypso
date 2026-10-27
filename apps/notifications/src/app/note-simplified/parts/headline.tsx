import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { html } from '../../../panel/indices-to-html';
import NoteIcon from '../../note-icon';
import { useIsPendingApproval } from '../use-is-pending-approval';
import NoteMeta from './note-meta';
import PendingApproval from './pending-approval';
import type { Note } from '../../types';

export default function Headline( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const { actor, summary } = note.meta ?? {};
	if ( ! summary || ! actor ) {
		return null;
	}
	const icon = <NoteIcon icon={ note.icon } size={ 36 } />;

	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			{ actor.url ? (
				// The sentence beside it links to the same person, so the photo stays out of the tab order.
				<a
					className="wpnc-simplified__photo"
					href={ actor.url }
					target="_blank"
					rel="noreferrer"
					tabIndex={ -1 }
					aria-hidden="true"
				>
					{ icon }
				</a>
			) : (
				<div className="wpnc-simplified__photo">{ icon }</div>
			) }
			<VStack className="wpnc-simplified__quiet-links" spacing={ 0 } style={ { width: '100%' } }>
				<div
					className="wpnc-simplified__sentence"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: html( summary ) } }
				/>
				<NoteMeta note={ note } />
			</VStack>
			{ isPendingApproval && <PendingApproval note={ note } /> }
		</HStack>
	);
}
