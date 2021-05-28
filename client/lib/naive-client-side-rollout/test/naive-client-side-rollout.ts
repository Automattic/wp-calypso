/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import naiveClientSideRollout from '../naive-client-side-rollout';

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
const naiveClientSideRolloutWithMockedUserId = ( percent, userId ) => {
	setUserId( userId );
	return naiveClientSideRollout( 'feature-id', percent );
};

const numRandomNums = 1000;
const randomNums = range( 0, numRandomNums ).map( ( x ) => x / numRandomNums );
afterEach( () => {
	jest.spyOn( global.Math, 'random' ).mockRestore();
} );
const naiveClientSideRolloutWithMockedRandom = ( percent, randomNumber ) => {
	jest.spyOn( global.Math, 'random' ).mockReturnValueOnce( randomNumber );
	return naiveClientSideRollout( 'feature-id', percent );
};

it( 'should roughly match percentages for userIds', () => {
	let returns = [];

	returns = userIds.map( ( userId ) => naiveClientSideRolloutWithMockedUserId( 21, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.21 );

	returns = userIds.map( ( userId ) => naiveClientSideRolloutWithMockedUserId( 50, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.5 );

	returns = userIds.map( ( userId ) => naiveClientSideRolloutWithMockedUserId( 68, userId ) );
	expect( returns.filter( ( x ) => x === true ).length / numUserIds ).toBeCloseTo( 0.68 );
} );

it( 'should continue to give same experience for already rolled out users on increased roll out for logged-in users', () => {
	const returns1 = userIds.map( ( userId ) =>
		naiveClientSideRolloutWithMockedUserId( 21, userId )
	);
	const returns2 = userIds.map( ( userId ) =>
		naiveClientSideRolloutWithMockedUserId( 50, userId )
	);

	expect(
		returns1
			.map( ( isRollout, i ) => [ isRollout, i ] )
			.filter( ( [ isRollout ] ) => isRollout === true )
			.map( ( [ , i ] ) => returns2[ i as number ] )
			.filter( ( isRollout ) => isRollout === true )
	).toEqual( returns1.filter( ( isRollout ) => isRollout === true ) );
} );

it( 'should match percentages for randomIds', () => {
	let returns = [];

	returns = randomNums.map( ( x ) => naiveClientSideRolloutWithMockedRandom( 21, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numRandomNums * 0.21 );

	returns = randomNums.map( ( x ) => naiveClientSideRolloutWithMockedRandom( 50, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numRandomNums * 0.5 );

	returns = randomNums.map( ( x ) => naiveClientSideRolloutWithMockedRandom( 68, x ) );
	expect( returns.filter( ( x ) => x === true ) ).toHaveLength( numRandomNums * 0.68 );
} );

it( 'should always return false for 0 percent', () => {
	const userReturns = userIds.map( ( userId ) =>
		naiveClientSideRolloutWithMockedUserId( 0, userId )
	);
	expect( userReturns.filter( ( x ) => x === false ) ).toHaveLength( numUserIds );

	const randomReturns = randomNums.map( ( x ) => naiveClientSideRolloutWithMockedRandom( 0, x ) );
	expect( randomReturns.filter( ( x ) => x === false ) ).toHaveLength( numRandomNums );
} );

it( 'should always return true for 100 percent', () => {
	const userReturns = userIds.map( ( userId ) =>
		naiveClientSideRolloutWithMockedUserId( 100, userId )
	);
	expect( userReturns.filter( ( x ) => x === true ) ).toHaveLength( numUserIds );

	const randomReturns = randomNums.map( ( x ) => naiveClientSideRolloutWithMockedRandom( 100, x ) );
	expect( randomReturns.filter( ( x ) => x === true ) ).toHaveLength( numRandomNums );
} );
