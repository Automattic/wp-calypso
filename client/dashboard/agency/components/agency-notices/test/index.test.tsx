/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import { AgencyNotices, SharedNoticesProvider } from '../index';
import type { NoticeCandidate } from '../index';

const candidate = ( id: string, overrides: Partial< NoticeCandidate > = {} ): NoticeCandidate => ( {
	id,
	isEligible: true,
	notice: <p>{ id }</p>,
	...overrides,
} );

function LoadingHarness( {
	loadingId,
	initiallyLoading,
}: {
	loadingId: string;
	initiallyLoading: boolean;
} ) {
	const [ isLoading, setIsLoading ] = useState( initiallyLoading );
	const withLoading = ( id: string ) =>
		candidate( id, { isLoading: id === loadingId && isLoading } );
	return (
		<>
			<button onClick={ () => setIsLoading( ( value ) => ! value ) }>Toggle loading</button>
			<AgencyNotices candidates={ [ withLoading( 'payment-risk' ), withLoading( 'payout' ) ] } />
		</>
	);
}

const renderedIds = () => screen.queryAllByRole( 'paragraph' ).map( ( el ) => el.textContent );

describe( '<AgencyNotices>', () => {
	test( 'shows urgent page notices, then shared ones, then the rest', () => {
		render(
			<SharedNoticesProvider candidates={ [ candidate( 'shared' ) ] }>
				<AgencyNotices
					candidates={ [ candidate( 'payout' ), candidate( 'payment-risk', { isUrgent: true } ) ] }
				/>
			</SharedNoticesProvider>
		);

		expect( renderedIds() ).toEqual( [ 'payment-risk', 'shared', 'payout' ] );
	} );

	test( 'leaves out notices that do not apply', () => {
		render(
			<AgencyNotices
				candidates={ [ candidate( 'payment-risk', { isEligible: false } ), candidate( 'payout' ) ] }
			/>
		);

		expect( renderedIds() ).toEqual( [ 'payout' ] );
	} );

	test( 'shows the notices above the first one still loading', async () => {
		render( <LoadingHarness loadingId="payout" initiallyLoading /> );

		expect( renderedIds() ).toEqual( [ 'payment-risk' ] );

		await userEvent.click( screen.getByRole( 'button', { name: 'Toggle loading' } ) );

		expect( renderedIds() ).toEqual( [ 'payment-risk', 'payout' ] );
	} );

	test( 'holds a notice back while one above it is still loading', () => {
		render( <LoadingHarness loadingId="payment-risk" initiallyLoading /> );

		expect( renderedIds() ).toEqual( [] );
	} );

	test( 'keeps showing a notice when its data loads again', async () => {
		render( <LoadingHarness loadingId="payment-risk" initiallyLoading={ false } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Toggle loading' } ) );

		expect( renderedIds() ).toEqual( [ 'payment-risk', 'payout' ] );
	} );
} );
