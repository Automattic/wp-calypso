import { openHelpCenterCallback } from '../callback';

const parseAgentMessage = ( agentMessage?: string ) => JSON.parse( agentMessage ?? 'null' );

describe( 'openHelpCenterCallback', () => {
	it( 'hands the chat a button carrying the message, and the summary as the reply', async () => {
		const result = await openHelpCenterCallback( {
			message: ' I need a person. ',
			summary: 'Click below.',
		} );

		expect( result.result ).toEqual( { success: true, message: 'Click below.' } );
		expect( result.returnToAgent ).toBe( true );
		expect( parseAgentMessage( result.agentMessage ) ).toEqual( {
			tool_id: 'big_sky__show_component',
			data: {
				type: 'open-help-center-button',
				props: { message: 'I need a person.' },
				summary: 'Click below.',
				isCurrent: true,
			},
		} );
	} );

	// The wire carries whatever the model sent; only strings with content count.
	it.each( [
		[ 'no input', undefined ],
		[ 'non-string fields', { message: 7, summary: [ 'x' ] } ],
		[ 'blank fields', { message: '  ', summary: '' } ],
	] )( 'falls back to the default summary and no message for %s', async ( _, input ) => {
		const result = await openHelpCenterCallback( input );

		expect( result.result.message ).toBe(
			'Click the button below to open the Help Center and talk to a human.'
		);
		expect( parseAgentMessage( result.agentMessage ).data.props ).toEqual( {} );
	} );
} );
