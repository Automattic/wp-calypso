import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CardHeader,
	Navigator,
	useNavigator,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import NoteBody from '../../panel/templates/body';
import SummaryInSingle from '../../panel/templates/summary-in-single';
import '../../panel/boot/stylesheets/style.scss';
import './style.scss';

const hasBadge = ( body: any ) =>
	body.some(
		( { media }: { media: any } ) =>
			media && media.some( ( { type }: { type: string } ) => 'badge' === type )
	);

const NoteContent = ( { note }: { note: any } ) => {
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const isRead = useSelector( ( state ) => getIsNoteRead( state, note ) );

	let hasCommentReply = false;
	let hasUnapprovedComment = false;
	if ( 'comment' === note.type ) {
		const noteBody = note.body;
		const noteActions = getActions( note );
		if ( noteBody.length > 1 && noteActions ) {
			/* Check if note has a reply to another comment */
			if ( noteBody[ 1 ] && noteBody[ 1 ].nest_level && noteBody[ 1 ].nest_level > 0 ) {
				hasCommentReply = true;
			}

			/* Check if note has unapproved comment */
			if ( 'approve-comment' in noteActions && ! isApproved ) {
				hasUnapprovedComment = true;
			}
		}
	}

	const classes = clsx( 'wpnc__note', `wpnc__${ note.type }`, 'wpnc__current', {
		'comment-reply': hasCommentReply,
		read: isRead,
		unread: ! isRead,
		wpnc__badge: hasBadge( note.body ),
		'wpnc__comment-unapproved': hasUnapprovedComment,
	} );

	return (
		<div className={ classes }>
			<div
				className="wpnc__note-body"
				role="region"
				aria-label={ __( 'Notification details' ) }
				tabIndex={ -1 }
			>
				{ note.header && note.header.length > 0 && (
					<SummaryInSingle key={ 'note-summary-single-' + note.id } note={ note } />
				) }
				<NoteBody note={ note } />
			</div>
		</div>
	);
};

const Note = () => {
	const { params } = useNavigator();
	const { noteId } = params;
	const note = useSelector( ( state ) =>
		getAllNotes( state ).find( ( note: any ) => String( note.id ) === noteId )
	);

	return (
		<>
			<CardHeader size="small">
				<HStack>
					<Navigator.BackButton
						icon={ isRTL() ? chevronRight : chevronLeft }
						style={ { padding: 0 } }
					>
						{ __( 'Back' ) }
					</Navigator.BackButton>
				</HStack>
			</CardHeader>
			<VStack>
				{ note && (
					<div className="wpnc__main">
						<div
							className={ clsx( 'wpnc__single-view', 'wpnc__current' ) }
							style={ {
								position: 'relative',
								left: 0,
								right: 0,
								overflow: 'auto',
								minHeight: '50vh',
								zIndex: 1,
							} }
						>
							<NoteContent note={ note } />
						</div>
					</div>
				) }
			</VStack>
		</>
	);
};

export default Note;
