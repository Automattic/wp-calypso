/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import { badNaiveClientSideRollout } from '../index';

jest.mock( 'calypso/lib/user' );
const mockedUser = user as jest.MockedFunction< typeof user >;
const setUserId = ( userId ) =>
	mockedUser.mockImplementationOnce( ( ( () => ( {
		get: () => ( { ID: userId } ),
	} ) ) as unknown ) as typeof user );

// [a, b)
const range = ( a, b ) => {
	const arr = [];
	for ( let i = a; i < b; i++ ) {
		arr.push( i );
	}
	return arr;
};

const numUserIds = 10000;
const userIds = range( 1, numUserIds + 1 );
const badNaiveClientSideRolloutWithMockedUserId = ( percent, userId ) => {
	setUserId( userId );
	return badNaiveClientSideRollout( 'feature-id', percent );
};

const numMockRandomNums = 1000;
const mockRandomNums = range( 0, numMockRandomNums ).map( ( x ) => x / numMockRandomNums );
afterEach( () => {
	jest.spyOn( global.Math, 'random' ).mockRestore();
} );
const badNaiveClientSideRolloutWithMockedRandom = ( percent, randomNumber ) => {
	setUserId( null );
	jest.spyOn( global.Math, 'random' ).mockReturnValueOnce( randomNumber );
	return badNaiveClientSideRollout( 'feature-id', percent );
};

it( 'should roughly match percentages for userIds', () => {
	let returns = [];

	returns = userIds.map( ( userId ) => badNaiveClientSideRolloutWithMockedUserId( 21, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.21 );

	returns = userIds.map( ( userId ) => badNaiveClientSideRolloutWithMockedUserId( 50, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.5 );

	returns = userIds.map( ( userId ) => badNaiveClientSideRolloutWithMockedUserId( 68, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.68 );
} );

it( 'should continue to give same experience for already rolled out users on increased roll out for logged-in users', () => {
	const returns1 = userIds.map( ( userId ) =>
		badNaiveClientSideRolloutWithMockedUserId( 21, userId )
	);
	const returns2 = userIds.map( ( userId ) =>
		badNaiveClientSideRolloutWithMockedUserId( 50, userId )
	);

	expect(
		returns1
			.map( ( isRollout, i ) => [ isRollout, i ] )
			.filter( ( [ isRollout ] ) => isRollout === true )
			.map( ( [ , i ] ) => returns2[ i as number ] )
			.filter( ( isRollout ) => isRollout === true )
	).toEqual( returns1.filter( ( isRollout ) => isRollout === true ) );
} );

it( 'should match percentages for random assignment without a logged-in user', () => {
	let returns = [];

	returns = mockRandomNums.map( ( x ) => badNaiveClientSideRolloutWithMockedRandom( 21, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numMockRandomNums * 0.21 );

	returns = mockRandomNums.map( ( x ) => badNaiveClientSideRolloutWithMockedRandom( 50, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numMockRandomNums * 0.5 );

	returns = mockRandomNums.map( ( x ) => badNaiveClientSideRolloutWithMockedRandom( 68, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numMockRandomNums * 0.68 );
} );

it( 'should always return false for 0 percent', () => {
	const userReturns = userIds.map( ( userId ) =>
		badNaiveClientSideRolloutWithMockedUserId( 0, userId )
	);
	expect( userReturns.every( ( x ) => x === false ) ).toBe( true );

	const randomReturns = mockRandomNums.map( ( x ) =>
		badNaiveClientSideRolloutWithMockedRandom( 0, x )
	);
	expect( randomReturns.every( ( x ) => x === false ) ).toBe( true );
} );

it( 'should always return true for 100 percent', () => {
	const userReturns = userIds.map( ( userId ) =>
		badNaiveClientSideRolloutWithMockedUserId( 100, userId )
	);
	expect( userReturns.filter( ( x ) => x === true ) ).toHaveLength( numUserIds );

	const randomReturns = mockRandomNums.map( ( x ) =>
		badNaiveClientSideRolloutWithMockedRandom( 100, x )
	);
	expect( randomReturns.filter( ( x ) => x === true ) ).toHaveLength( numMockRandomNums );
} );
