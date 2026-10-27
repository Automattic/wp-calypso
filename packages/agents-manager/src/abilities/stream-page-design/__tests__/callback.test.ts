jest.mock( '../stream', () => ( {
	...jest.requireActual( '../stream' ),
	finalizePendingStreams: jest.fn().mockResolvedValue( true ),
} ) );

import { streamPageDesignCallback } from '../callback';
import { finalizePendingStreams } from '../stream';

beforeEach( () => jest.clearAllMocks() );

it( 'finalizes its own stream, then completes the round trip with the summary', async () => {
	const result = await streamPageDesignCallback( {
		summary: '  A fresh hero.  ',
		toolCallId: 'call-1',
	} );

	expect( finalizePendingStreams ).toHaveBeenCalledWith( 'call-1' );
	expect( result ).toEqual( {
		result: { success: true, message: 'A fresh hero.' },
		returnToAgent: true,
		agentMessage: JSON.stringify( {
			tool_id: 'big_sky__stream_page_design',
			data: { summary: 'A fresh hero.', isCurrent: true },
		} ),
	} );
} );

it( 'reports a design the canvas never took, without a staged summary', async () => {
	( finalizePendingStreams as jest.Mock ).mockResolvedValueOnce( false );

	const result = await streamPageDesignCallback( { summary: 'A fresh hero.' } );

	expect( result.result.success ).toBe( false );
	expect( result.result.error ).toContain( 'did not take the page design' );
	expect( result.returnToAgent ).toBe( true );
	expect( result.agentMessage ).toBeUndefined();
} );

it.each( [ { summary: '   ' }, { summary: 7, toolCallId: 7 }, null ] )(
	'falls back to the staged message for %p, finalizing whatever is pending',
	async ( input ) => {
		const result = await streamPageDesignCallback( input as never );

		expect( finalizePendingStreams ).toHaveBeenCalledWith( undefined );
		expect( result.result.message ).toBe(
			'The generated page content has been staged in the editor for review.'
		);
		expect( result.returnToAgent ).toBe( true );
	}
);
