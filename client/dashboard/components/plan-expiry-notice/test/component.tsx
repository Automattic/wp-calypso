/**
 * @jest-environment jsdom
 */
import { DotcomPlans } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { PlanExpiryNotice } from '..';
import { NOW, expiryInDays, makePurchase, postGrace } from './fixtures';
import type { ComponentProps } from 'react';

type Props = Partial< ComponentProps< typeof PlanExpiryNotice > >;

const newQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

function notice( recordTracksEvent: jest.Mock, extra: Props = {} ) {
	return (
		<PlanExpiryNotice
			purchase={ makePurchase( { expiry_date: expiryInDays( 3 ) } ) }
			locale="en"
			surface="test"
			scope="sitewide"
			recordTracksEvent={ recordTracksEvent }
			{ ...extra }
		/>
	);
}

function renderNotice( extra: Props = {} ) {
	const recordTracksEvent = jest.fn();
	render(
		<QueryClientProvider client={ newQueryClient() }>
			{ notice( recordTracksEvent, extra ) }
		</QueryClientProvider>
	);
	return { recordTracksEvent };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => MockDate.reset() );

test( 'sitewide impression carries the aligned properties', () => {
	const { recordTracksEvent } = renderNotice( { eventProperties: { page: 'overview' } } );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( {
			surface: 'test',
			page: 'overview',
			purchase_id: 1234,
			product_slug: DotcomPlans.BUSINESS,
			stage: 'final-window',
			state: 'approaching_expiry',
			days_remaining: 3,
			is_plan_owner: true,
			variant: 'error',
		} )
	);
} );

test( 'a re-render with an equal but new eventProperties object does not re-fire the impression', () => {
	const recordTracksEvent = jest.fn();
	const queryClient = newQueryClient();
	const purchase = makePurchase( { expiry_date: expiryInDays( 3 ) } );
	const tree = () => (
		<QueryClientProvider client={ queryClient }>
			{ notice( recordTracksEvent, { purchase, eventProperties: { page: 'overview' } } ) }
		</QueryClientProvider>
	);

	const { rerender } = render( tree() );
	rerender( tree() );

	expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( { page: 'overview' } )
	);
} );

test( 'clicks name the cta beside the action', async () => {
	const { recordTracksEvent } = renderNotice();
	await userEvent.click( screen.getByRole( 'link', { name: 'Renew now' } ) );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_click',
		expect.objectContaining( { action: 'renew', cta: 'primary' } )
	);
} );

test( 'contact support is a button that hands over the message, cta support', async () => {
	const onContactSupport = jest.fn();
	const { recordTracksEvent } = renderNotice( {
		isReverted: true,
		onContactSupport,
		purchase: postGrace(),
	} );
	await userEvent.click( screen.getByRole( 'button', { name: 'Contact support' } ) );
	expect( onContactSupport ).toHaveBeenCalledWith(
		'My Business plan expired and I need your help getting it restored.'
	);
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_click',
		expect.objectContaining( { action: 'contact-support', cta: 'support' } )
	);
} );
