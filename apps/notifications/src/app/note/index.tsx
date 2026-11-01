import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	Button,
	CardHeader,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, arrowUp, arrowDown } from '@wordpress/icons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import SimplifiedNote from '../note-simplified';
import { getTemporaryNoteTitle } from '../note-simplified/labels';
import { ReplyFooter, SimplifiedActionBlock } from '../templates/body';
import CloseButton from '../templates/close-button';
import './style.scss';
import type { NoteNavigation } from './hooks';
import type { Note as NoteObject } from '../types';

type NoteProps = {
	isDismissible?: boolean;
	// The note id to render — equals the user's selection while open and
	// the exiting id during the slide-out animation.
	noteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
	noteNavigation: NoteNavigation;
};

const Note = ( { isDismissible, noteId, setSelectedNoteId, noteNavigation }: NoteProps ) => {
	const dispatch = useDispatch();
	const isLargeScreen = useViewportMatch( 'large' );
	const goBack = () => setSelectedNoteId( undefined );

	const notes = useSelector( ( state ) => ( getAllNotes( state ) || [] ) as NoteObject[] );
	const note = notes.find( ( note ) => String( note.id ) === noteId );

	useEffect( () => {
		if ( note?.id ) {
			dispatch( actions.ui.selectNote( note.id ) );
		}
	}, [ note?.id, dispatch ] );

	if ( ! note ) {
		return null;
	}

	return (
		<>
			<CardHeader
				size="small"
				style={ {
					position: 'sticky',
					top: 0,
					background: 'var( --color-surface, #fff )',
					zIndex: 1,
				} }
			>
				<HStack>
					<HStack justify="flex-start">
						{ ! isLargeScreen && (
							<Button
								size="small"
								icon={ isRTL() ? chevronRight : chevronLeft }
								label={ __( 'Back' ) }
								onClick={ goBack }
							/>
						) }
						<Heading level={ 3 } size={ 15 } weight={ 500 }>
							{ getTemporaryNoteTitle( note ) }
						</Heading>
					</HStack>
					<HStack justify="flex-end" style={ { width: 'auto', flexShrink: 0 } }>
						{ ! isLargeScreen && (
							<>
								<Button
									size="small"
									icon={ arrowUp }
									label={ __( 'Previous notification' ) }
									onClick={ noteNavigation.goToPreviousNote }
									disabled={ ! noteNavigation.hasPreviousNote }
									accessibleWhenDisabled
								/>
								<Button
									size="small"
									icon={ arrowDown }
									label={ __( 'Next notification' ) }
									onClick={ noteNavigation.goToNextNote }
									disabled={ ! noteNavigation.hasNextNote }
									accessibleWhenDisabled
								/>
							</>
						) }
						{ isDismissible && <CloseButton /> }
					</HStack>
				</HStack>
			</CardHeader>
			<CardBody size="small" style={ { maxHeight: 'unset' } }>
				<VStack justify="flex-start" spacing={ 6 }>
					<SimplifiedNote note={ note } />
					<SimplifiedActionBlock note={ note } goBack={ goBack } />
				</VStack>
			</CardBody>
			<ReplyFooter note={ note } />
		</>
	);
};

export default Note;
