/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import ResourceModal from '../resource-modal';
import type { AgencyEnablementResource } from '@automattic/api-core';

function resource( overrides: Partial< AgencyEnablementResource > = {} ) {
	return {
		id: 1,
		name: 'Pressable upsell patterns',
		description: 'When to recommend Pressable.',
		external_url: 'https://example.com/pressable.pdf',
		thumbnail_url: null,
		product: 'pressable',
		stage: 'grow',
		audience: 'all',
		content_type: 'guide',
		format: 'pdf',
		is_featured: false,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides,
	} satisfies AgencyEnablementResource;
}

function renderModal( props: Partial< Parameters< typeof ResourceModal >[ 0 ] > = {} ) {
	const callbacks = {
		onClose: jest.fn(),
		onOpen: jest.fn(),
		onFilter: jest.fn(),
		onToggleRead: jest.fn(),
	};
	render(
		<ResourceModal resource={ resource() } isRead={ false } { ...callbacks } { ...props } />
	);
	return callbacks;
}

describe( 'ResourceModal', () => {
	test( "shows the resource's details and a link to open it", () => {
		renderModal();

		expect( screen.getByRole( 'heading', { name: 'Pressable upsell patterns' } ) ).toBeVisible();
		expect( screen.getByText( 'When to recommend Pressable.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Open in new tab' } ) ).toHaveAttribute(
			'href',
			'https://example.com/pressable.pdf'
		);
	} );

	test( 'leads the badges with "Top resource" for featured resources', () => {
		renderModal( { resource: resource( { is_featured: true } ) } );

		expect( screen.getByRole( 'button', { name: 'Filter by Top resource' } ) ).toBeVisible();
	} );

	test( 'disables the navigation it has nowhere to go', () => {
		renderModal();

		// Still focusable, so they announce themselves as disabled instead.
		expect( screen.getByRole( 'button', { name: 'Previous resource' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'button', { name: 'Next resource' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'moves between resources with the buttons', async () => {
		const onPrevious = jest.fn();
		const onNext = jest.fn();
		renderModal( { onPrevious, onNext } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Previous resource' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Next resource' } ) );

		expect( onPrevious ).toHaveBeenCalledTimes( 1 );
		expect( onNext ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'moves between resources with the arrow keys, but not modified ones', async () => {
		const onPrevious = jest.fn();
		const onNext = jest.fn();
		renderModal( { onPrevious, onNext } );

		await userEvent.keyboard( '{ArrowLeft}{ArrowRight}' );
		await userEvent.keyboard( '{Alt>}{ArrowRight}{/Alt}' );

		expect( onPrevious ).toHaveBeenCalledTimes( 1 );
		expect( onNext ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'marks the resource as read, and shows when it is', async () => {
		const { onToggleRead } = renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Mark as read' } ) );

		expect( onToggleRead ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'shows a read resource as pressed', () => {
		renderModal( { isRead: true } );

		expect( screen.getByRole( 'button', { name: 'Read' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	test( 'filters the library from a badge', async () => {
		const { onFilter } = renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Filter by Grow' } ) );

		expect( onFilter ).toHaveBeenCalledWith( 'stage', 'grow' );
	} );

	test( 'copies a link to the resource', async () => {
		const writeText = jest.fn().mockResolvedValue( undefined );
		Object.defineProperty( window.navigator, 'clipboard', {
			value: { writeText },
			configurable: true,
		} );
		renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Copy link' } ) );

		expect( writeText ).toHaveBeenCalledWith( 'https://example.com/?resource=1' );
		expect( screen.getByRole( 'button', { name: 'Link copied' } ) ).toBeVisible();
	} );
} );
