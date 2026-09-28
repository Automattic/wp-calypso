/**
 * @jest-environment jsdom
 */

import { isModalOpen, isSurveyVisible, observeModals } from '../modal-detection';

function makeRendered< T extends HTMLElement >( el: T ): T {
	( el as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
	return el;
}

describe( 'isModalOpen', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should return false when the document has no modals', () => {
		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should detect an aria-modal dialog', () => {
		const modal = makeRendered( document.createElement( 'div' ) );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should detect an open native dialog', () => {
		const dialog = makeRendered( document.createElement( 'dialog' ) );
		dialog.setAttribute( 'open', '' );
		document.body.appendChild( dialog );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should detect a WordPress modal screen overlay', () => {
		const overlay = makeRendered( document.createElement( 'div' ) );
		overlay.className = 'components-modal__screen-overlay';
		document.body.appendChild( overlay );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should detect a WordPress popover', () => {
		const popover = makeRendered( document.createElement( 'div' ) );
		popover.className = 'components-popover';
		document.body.appendChild( popover );

		expect( isModalOpen() ).toBe( true );
	} );

	test( 'should ignore a WordPress tooltip', () => {
		const tooltip = makeRendered( document.createElement( 'div' ) );
		tooltip.className = 'components-popover components-tooltip';
		document.body.appendChild( tooltip );

		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should ignore a dialog role without aria-modal', () => {
		const popover = makeRendered( document.createElement( 'div' ) );
		popover.setAttribute( 'role', 'dialog' );
		document.body.appendChild( popover );

		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should ignore dialogs inside the Survicate widget', () => {
		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		box.className = 'survicate-box-survey';
		const survey = makeRendered( document.createElement( 'div' ) );
		survey.setAttribute( 'role', 'dialog' );
		survey.setAttribute( 'aria-modal', 'true' );
		box.appendChild( survey );
		document.body.appendChild( box );

		expect( isModalOpen() ).toBe( false );
	} );

	test( 'should ignore a modal that is not rendered', () => {
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => false;
		document.body.appendChild( modal );

		expect( isModalOpen() ).toBe( false );
	} );
} );

describe( 'isSurveyVisible', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should return false when no Survicate survey is on screen', () => {
		expect( isSurveyVisible() ).toBe( false );
	} );

	test( 'should detect a rendered survey dialog inside the Survicate box', () => {
		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		const survey = makeRendered( document.createElement( 'div' ) );
		survey.setAttribute( 'role', 'dialog' );
		box.appendChild( survey );
		document.body.appendChild( box );

		expect( isSurveyVisible() ).toBe( true );
	} );

	test( 'should ignore a survey dialog that is not rendered', () => {
		const box = document.createElement( 'div' );
		box.className = 'survicate-box-survey';
		const survey = document.createElement( 'div' );
		survey.setAttribute( 'role', 'dialog' );
		( survey as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => false;
		box.appendChild( survey );
		document.body.appendChild( box );

		expect( isSurveyVisible() ).toBe( false );
	} );

	test( 'should ignore a modal dialog outside the Survicate box', () => {
		const modal = makeRendered( document.createElement( 'div' ) );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );

		expect( isSurveyVisible() ).toBe( false );
	} );
} );

describe( 'observeModals', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	function flushMutations() {
		return new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	}

	test( 'should fire when a modal is inserted', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await flushMutations();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
		disconnect();
	} );

	test( 'should fire when an inserted subtree contains a modal', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const wrapper = document.createElement( 'div' );
		const modal = document.createElement( 'dialog' );
		modal.setAttribute( 'open', '' );
		wrapper.appendChild( modal );
		document.body.appendChild( wrapper );
		await flushMutations();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
		disconnect();
	} );

	test( 'should not fire for non-modal insertions', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		document.body.appendChild( document.createElement( 'div' ) );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should not fire for the Survicate widget itself', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );

		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		const survey = document.createElement( 'div' );
		survey.setAttribute( 'role', 'dialog' );
		survey.setAttribute( 'aria-modal', 'true' );
		box.appendChild( survey );
		document.body.appendChild( box );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should stop firing after disconnect', async () => {
		const onOpen = jest.fn();
		const disconnect = observeModals( onOpen );
		disconnect();

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( modal );
		await flushMutations();

		expect( onOpen ).not.toHaveBeenCalled();
	} );

	function appendModal() {
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );
		return modal;
	}

	test( 'should fire onAllClosed when the last modal is removed', async () => {
		const modal = appendModal();
		const onOpen = jest.fn();
		const onAllClosed = jest.fn();
		const disconnect = observeModals( onOpen, onAllClosed );

		modal.remove();
		await flushMutations();

		expect( onAllClosed ).toHaveBeenCalledTimes( 1 );
		disconnect();
	} );

	test( 'should not fire onAllClosed while another modal remains open', async () => {
		const first = appendModal();
		appendModal();
		const onAllClosed = jest.fn();
		const disconnect = observeModals( jest.fn(), onAllClosed );

		first.remove();
		await flushMutations();

		expect( onAllClosed ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should not fire onAllClosed when the Survicate widget is removed', async () => {
		const box = document.createElement( 'div' );
		box.id = 'survicate-box';
		const survey = document.createElement( 'div' );
		survey.setAttribute( 'role', 'dialog' );
		survey.setAttribute( 'aria-modal', 'true' );
		box.appendChild( survey );
		document.body.appendChild( box );

		const onAllClosed = jest.fn();
		const disconnect = observeModals( jest.fn(), onAllClosed );

		box.remove();
		await flushMutations();

		expect( onAllClosed ).not.toHaveBeenCalled();
		disconnect();
	} );

	test( 'should not fire onAllClosed for non-modal removals', async () => {
		const div = document.createElement( 'div' );
		document.body.appendChild( div );
		const onAllClosed = jest.fn();
		const disconnect = observeModals( jest.fn(), onAllClosed );

		div.remove();
		await flushMutations();

		expect( onAllClosed ).not.toHaveBeenCalled();
		disconnect();
	} );
} );
