import { getParentComment } from 'calypso/state/comments/selectors';

const state = {
	comments: {
		items: {
			'123-4': [
				{
					ID: 1,
					parent: { ID: 0 },
				},
				{
					ID: 2,
					parent: { ID: 1 },
				},
			],
		},
	},
};

describe( 'getParentComment()', () => {
	test( 'should return the parent comment if available', () => {
		expect( getParentComment( state, 123, 4, 2 ) ).toEqual( {
			ID: 1,
			parent: { ID: 0 },
		} );
	} );
	test( 'should return an empty object if the parent comment is not available', () => {
		expect( getParentComment( state, 123, 4, 1 ) ).toEqual( {} );
	} );
	test( 'should return an empty object if the site does not exist', () => {
		expect( getParentComment( state, 456, 4, 2 ) ).toEqual( {} );
	} );
	test( 'should return an empty object if the post does not exist', () => {
		expect( getParentComment( state, 123, 5, 2 ) ).toEqual( {} );
	} );
	test( 'should return an empty object if the comment does not exist', () => {
		expect( getParentComment( state, 123, 4, 3 ) ).toEqual( {} );
	} );
} );
