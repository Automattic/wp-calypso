/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { HelpCenterCTA } from '../help-center-cta';

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const baseProps = {
	ctaId: 'onboarding-call-v1',
	placement: 'help-center-home',
	url: 'https://calendly.example.com/onboarding',
	title: 'Get set up with a free onboarding call',
	description: 'Talk one-on-one with a Happiness Engineer and get your new site off the ground.',
};

describe( 'HelpCenterCTA', () => {
	afterEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	describe( 'banner variant', () => {
		it( 'renders title, description, and actionLabel from props', () => {
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			expect( screen.getByText( baseProps.title ) ).toBeVisible();
			expect( screen.getByText( baseProps.description ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Book your free call' } ) ).toBeVisible();
		} );

		it( 'fires the impression event exactly once on mount', () => {
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: baseProps.placement,
			} );
		} );

		it( 'fires the click event with the same payload when clicked', async () => {
			const user = userEvent.setup();
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link', { name: 'Book your free call' } ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: baseProps.placement,
			} );
		} );

		it( 'opens the link in a new tab without a referrer', () => {
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			const link = screen.getByRole( 'link', { name: 'Book your free call' } );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noreferrer' );
		} );

		it( 'renders no link when actionLabel is not provided', () => {
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			expect( screen.getByText( baseProps.title ) ).toBeVisible();
			expect( screen.getByText( baseProps.description ) ).toBeVisible();
			expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		} );

		it( 'still fires the impression event when actionLabel is not provided', () => {
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: baseProps.placement,
			} );
		} );
	} );

	describe( 'link-list-item variant', () => {
		it( 'renders title and description from props', () => {
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			expect( screen.getByText( baseProps.title ) ).toBeVisible();
			expect( screen.getByText( baseProps.description ) ).toBeVisible();
		} );

		it( 'fires the impression event exactly once on mount', () => {
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'link-list-item',
				placement: baseProps.placement,
			} );
		} );

		it( 'fires the click event with the same payload when clicked', async () => {
			const user = userEvent.setup();
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'link-list-item',
				placement: baseProps.placement,
			} );
		} );

		it( 'opens the link in a new tab without a referrer', () => {
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			const link = screen.getByRole( 'link' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noreferrer' );
		} );
	} );
} );
