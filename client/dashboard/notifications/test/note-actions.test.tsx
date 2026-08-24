/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	getAvailableNoteActions,
	replyToNote,
	setApprovalStatus,
	setLikeStatus,
	spamNote,
	trashNote,
	undoPendingAction,
	useIsNoteApproved,
	usePendingUndoableAction,
} from '../engine';
import NoteActions from '../note-actions';
import type { AvailableNoteActions, Note } from '../engine';

jest.mock( '../engine', () => ( {
	getAvailableNoteActions: jest.fn(),
	useIsNoteApproved: jest.fn( () => false ),
	useIsNoteLiked: jest.fn( () => false ),
	usePendingUndoableAction: jest.fn( () => null ),
	setApprovalStatus: jest.fn(),
	setLikeStatus: jest.fn(),
	spamNote: jest.fn(),
	trashNote: jest.fn(),
	undoPendingAction: jest.fn(),
	replyToNote: jest.fn( () => Promise.resolve() ),
	editCommentContent: jest.fn( () => Promise.resolve() ),
	getNoteEditLink: jest.fn( () => undefined ),
	setFollowStatus: jest.fn( () => Promise.resolve( true ) ),
} ) );

const NO_ACTIONS: AvailableNoteActions = {
	replyToComment: false,
	likePost: false,
	likeComment: false,
	approveComment: false,
	spamComment: false,
	trashComment: false,
	editComment: false,
	answerPromptHref: null,
	follow: null,
};

const note = {
	id: 1,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: new Date().toISOString(),
	icon: '',
	url: '',
	title: 'A note',
	note_hash: 1,
	subject: [ { text: 'Alice commented' } ],
	body: [],
} as unknown as Note;

const mockActions = ( overrides: Partial< AvailableNoteActions > ) => {
	jest.mocked( getAvailableNoteActions ).mockReturnValue( { ...NO_ACTIONS, ...overrides } );
};

describe( 'NoteActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( usePendingUndoableAction ).mockReturnValue( null );
	} );

	it( 'renders only the actions the note supports', () => {
		mockActions( { approveComment: true, likeComment: true } );
		render( <NoteActions note={ note } /> );
		expect( screen.getByRole( 'button', { name: 'Approve' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Like' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Reply' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Trash' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when the note supports no actions', () => {
		mockActions( {} );
		const { container } = render( <NoteActions note={ note } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'toggles approval with the opposite of the current state', async () => {
		mockActions( { approveComment: true } );
		jest.mocked( useIsNoteApproved ).mockReturnValue( true );
		render( <NoteActions note={ note } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Approved' } ) );
		expect( setApprovalStatus ).toHaveBeenCalledWith( note, false );
	} );

	it( 'toggles like', async () => {
		mockActions( { likePost: true } );
		render( <NoteActions note={ note } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Like' } ) );
		expect( setLikeStatus ).toHaveBeenCalledWith( note, true );
	} );

	it( 'fires the undo-first spam and trash flows without a confirm', async () => {
		mockActions( { spamComment: true, trashComment: true } );
		render( <NoteActions note={ note } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Spam' } ) );
		expect( spamNote ).toHaveBeenCalledWith( note );
		await userEvent.click( screen.getByRole( 'button', { name: 'Trash' } ) );
		expect( trashNote ).toHaveBeenCalledWith( note );
	} );

	it( 'shows the undo bar for a pending action and undoes it', async () => {
		mockActions( {} );
		jest.mocked( usePendingUndoableAction ).mockReturnValue( { kind: 'trash', note } );
		render( <NoteActions note={ note } /> );
		expect( screen.getByText( 'Comment moved to trash.' ) ).toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );
		expect( undoPendingAction ).toHaveBeenCalled();
	} );

	it( 'sends a reply through the adapter', async () => {
		mockActions( { replyToComment: true } );
		render( <NoteActions note={ note } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Reply' } ) );
		await userEvent.type( screen.getByRole( 'textbox' ), 'Thanks!' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Send reply' } ) );
		expect( replyToNote ).toHaveBeenCalledWith( note, 'Thanks!' );
	} );
} );
