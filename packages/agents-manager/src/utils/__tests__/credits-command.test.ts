import {
	getCreditsAnswerSummary,
	getTopUpCreditsRemaining,
	isCreditsCommand,
} from '../credits-command';
import { buildLiveCreditsStatus } from '../live-credits';
import { creditSnapshot } from './fixtures/credit-snapshot';

jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
	sprintf: ( format: string, ...values: unknown[] ) => {
		let index = 0;
		return format.replace( /%(\d+\$)?[sd]/g, () => String( values[ index++ ] ) );
	},
} ) );

const withTopUps = ( remaining: number ) =>
	buildLiveCreditsStatus(
		creditSnapshot( {
			credits_available: 3200,
			top_up_credits_purchased: 1000,
			top_up_credits_remaining: remaining,
		} )
	);

describe( 'isCreditsCommand', () => {
	it.each( [ '/credits', '  /credits\n' ] )( 'matches %j', ( message ) => {
		expect( isCreditsCommand( message ) ).toBe( true );
	} );

	it.each( [ 'credits', '/credits now', '/credit', '/Credits', 'what is /credits', '' ] )(
		'leaves %j for the model',
		( message ) => {
			expect( isCreditsCommand( message ) ).toBe( false );
		}
	);
} );

describe( 'getTopUpCreditsRemaining', () => {
	it( 'gives the top-ups left', () => {
		expect( getTopUpCreditsRemaining( withTopUps( 800 ) ) ).toBe( 800 );
	} );

	it.each( [
		[ 'used up', withTopUps( 0 ) ],
		[ 'never bought', buildLiveCreditsStatus( creditSnapshot() ) ],
	] )( 'hides top-ups that are %s', ( _name, status ) => {
		expect( getTopUpCreditsRemaining( status ) ).toBeUndefined();
	} );
} );

describe( 'getCreditsAnswerSummary', () => {
	it( 'reads the balance, the reset date, the top-ups and the hint as one sentence', () => {
		expect( getCreditsAnswerSummary( withTopUps( 800 ), 'Ask a site admin to add more.' ) ).toBe(
			'3.2k credits left. Resets Oct 1 (UTC). Top-ups: 800 credits left. Ask a site admin to add more.'
		);
	} );
} );
