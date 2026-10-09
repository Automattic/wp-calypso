import { hasPressableUpgrade } from '../pressable-plans';
import type { PressablePlan, PressablePlanCategory } from '../pressable-plans';

const plan = (
	slug: string,
	category: PressablePlanCategory,
	install: number
): PressablePlan => ( {
	slug,
	category,
	install,
	visits: install * 10000,
	storage: install * 10,
	worker: 5,
} );

const signature1 = plan( 'signature-1', 'signature', 1 );
const signature10 = plan( 'signature-10', 'signature', 150 );
const signature11 = plan( 'signature-11', 'signature-high', 200 );
const signature17 = plan( 'signature-17', 'signature-high', 500 );
const premium1 = plan( 'premium-1', 'premium', 1 );
const catalog = [ signature1, signature10, signature11, signature17, premium1 ];

describe( 'hasPressableUpgrade', () => {
	test( 'a pooled plan below the largest one can move up', () => {
		expect( hasPressableUpgrade( signature1, catalog ) ).toBe( true );
		expect( hasPressableUpgrade( signature10, catalog ) ).toBe( true );
	} );

	test( 'the largest pooled plan has nothing above it, Premium aside', () => {
		expect( hasPressableUpgrade( signature17, catalog ) ).toBe( false );
	} );
} );
