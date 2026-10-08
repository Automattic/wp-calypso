import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { getEditCommentLink, getReferenceId } from '../../panel/helpers/notes';
import {
	setApproveStatus as setApproveStatusAction,
	spamNote as spamNoteAction,
	trashNote as trashNoteAction,
} from '../../panel/state/notes/thunks';
import { editComment as editCommentAction } from '../../panel/state/ui/actions';
import { useAppContext } from '../context';
import HotkeyContainer from './container-hotkey';

const ActionsMenu = ( {
	hasAction,
	isApproved,
	note,
	goBack,
	editComment,
	setApproveStatus,
	spamNote,
	trashNote,
} ) => {
	const { client } = useAppContext();
	const [ isBusy, setIsBusy ] = useState( false );
	const { site: siteId, post: postId, comment: commentId } = note?.meta?.ids ?? {};

	const removeWith = ( remove ) => async () => {
		if ( isBusy ) {
			return;
		}
		setIsBusy( true );
		await remove( note, true );
		goBack();
	};

	const groups = [
		[
			hasAction( 'edit-comment' ) && {
				hotkey: 'e',
				label: __( 'Edit' ),
				action: () => editComment( siteId, postId, commentId, getEditCommentLink( note ) ),
			},
			hasAction( 'approve-comment' ) && {
				hotkey: 'a',
				label: isApproved ? __( 'Unapprove' ) : __( 'Approve' ),
				action: () =>
					setApproveStatus(
						note.id,
						getReferenceId( note, 'site' ),
						getReferenceId( note, 'comment' ),
						! isApproved,
						note.type,
						client
					),
			},
		],
		[
			hasAction( 'spam-comment' ) && {
				hotkey: 's',
				label: __( 'Mark as spam' ),
				action: removeWith( spamNote ),
			},
			hasAction( 'trash-comment' ) && {
				hotkey: 't',
				label: __( 'Move to trash' ),
				isDestructive: true,
				action: removeWith( trashNote ),
			},
		],
	]
		.map( ( group ) => group.filter( Boolean ) )
		.filter( ( group ) => group.length > 0 );

	// The items only mount while the menu is open, so the shortcuts live out here.
	const shortcuts = groups.flat().map( ( { hotkey, action } ) => ( { hotkey, action } ) );

	return (
		<HotkeyContainer shortcuts={ shortcuts }>
			<DropdownMenu
				icon={ chevronDown }
				text={ __( 'Actions' ) }
				label={ __( 'Actions' ) }
				toggleProps={ {
					className: 'wpnc__actions-menu-toggle',
					variant: 'secondary',
					size: 'compact',
					iconPosition: 'right',
					showTooltip: false,
					isBusy,
					disabled: isBusy,
				} }
				popoverProps={ { placement: 'bottom-end' } }
			>
				{ ( { onClose } ) =>
					groups.map( ( group ) => (
						<MenuGroup key={ group[ 0 ].hotkey }>
							{ group.map( ( { hotkey, label, isDestructive, action } ) => (
								<MenuItem
									key={ hotkey }
									isDestructive={ isDestructive }
									onClick={ ( event ) => {
										// Prevent the notification panel from being closed.
										event.stopPropagation();
										onClose();
										action();
									} }
								>
									{ label }
								</MenuItem>
							) ) }
						</MenuGroup>
					) )
				}
			</DropdownMenu>
		</HotkeyContainer>
	);
};

ActionsMenu.propTypes = {
	hasAction: PropTypes.func.isRequired,
	isApproved: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	goBack: PropTypes.func.isRequired,
};

export default connect( null, {
	editComment: editCommentAction,
	setApproveStatus: setApproveStatusAction,
	spamNote: spamNoteAction,
	trashNote: trashNoteAction,
} )( ActionsMenu );
