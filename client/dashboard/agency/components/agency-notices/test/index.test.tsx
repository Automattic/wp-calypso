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

function LoadingHarness( { initiallyLoading }: { initiallyLoading: boolean } ) {
	const [ isLoading, setIsLoading ] = useState( initiallyLoading );
	return (
		<>
			<button onClick={ () => setIsLoading( ( value ) => ! value ) }>Toggle loading</button>
			<AgencyNotices
				candidates={ [ candidate( 'payment-risk' ), candidate( 'payout', { isLoading } ) ] }
			/>
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

	test( 'shows nothing until every notice has loaded', async () => {
		render( <LoadingHarness initiallyLoading /> );

		expect( renderedIds() ).toEqual( [] );

		await userEvent.click( screen.getByRole( 'button', { name: 'Toggle loading' } ) );

		expect( renderedIds() ).toEqual( [ 'payment-risk', 'payout' ] );
	} );

	test( 'keeps showing the notices when one starts loading again', async () => {
		render( <LoadingHarness initiallyLoading={ false } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Toggle loading' } ) );

		expect( renderedIds() ).toContain( 'payment-risk' );
	} );
} );
