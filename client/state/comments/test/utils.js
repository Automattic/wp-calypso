/**
 * External dependencies
 */
import { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	createRequestId,
	buildCommentsTree,
	updateExistingIn
} from '../utils';

describe( 'utils', () => {
	describe( '#createRequestId()', () => {
		it( 'should create the same id for differently ordered but same queries', () => {
			const props = [ 'first', 'second', 'third', 'fourth' ];
			let firstQuery = {};
			let secondQuery = {};

			props.forEach( ( prop ) => firstQuery[ prop ] = prop );
			props.reverse().forEach( ( prop ) => secondQuery[ prop ] = prop );

			const firstQueryId = createRequestId( 1, 1, firstQuery );
			const secondQueryId = createRequestId( 1, 1, secondQuery );

			expect( firstQueryId ).to.eql( secondQueryId );
		} );
	} );

	describe( '#buildCommentsTree()', () => {
		it( 'should build valid tree', () => {
			const commentsTreeForPost = buildCommentsTree( Immutable.fromJS( [
				{ ID: 11, parent: { ID: 9 }, text: 'eleven', date: '2016-01-31T10:07:18-08:00' },
				{ ID: 10, parent: { ID: 9 }, text: 'ten', date: '2016-01-29T10:07:18-08:00' },
				{ ID: 9, parent: { ID: 6 }, text: 'nine', date: '2016-01-28T11:07:18-08:00' },
				{ ID: 8, parent: false, text: 'eight', date: '2016-01-28T10:17:18-08:00' },
				{ ID: 7, parent: false, text: 'seven', date: '2016-01-28T10:08:18-08:00' },
				{ ID: 6, parent: false, text: 'six', date: '2016-01-28T10:07:18-08:00' }
			] ) );

			const parent = commentsTreeForPost.get( 6 );
			const firstChildOfParentId = parent.getIn( [ 'children', 0 ] );
			const actualFirstChildOfParent = commentsTreeForPost.get( firstChildOfParentId );

			expect( Immutable.Map.isMap( commentsTreeForPost ) ).to.equal( true );
			expect( Immutable.Map.isMap( parent ) ).to.equal( true );
			expect( Immutable.List.isList( parent.get( 'children' ) ) ).to.equal( true );
			expect( firstChildOfParentId ).to.be.a.number;
			expect( actualFirstChildOfParent.getIn( [ 'data', 'ID' ] ) ).to.equal( 9 );

			expect( commentsTreeForPost.getIn( [ 9, 'children' ] ).size ).to.equal( 2 );
			expect( commentsTreeForPost.getIn( [ 9, 'children', 0 ] ) ).to.equal( 11 );
			expect( commentsTreeForPost.getIn( [ 9, 'children', 1 ] ) ).to.equal( 10 );

			expect( commentsTreeForPost.getIn( [ 10, 'parentId' ] ) ).to.equal( 9 );
			expect( commentsTreeForPost.getIn( [ 10, 'children' ] ).size ).to.equal( 0 );

			expect( commentsTreeForPost.getIn( [ 11, 'parentId' ] ) ).to.equal( 9 );
			expect( commentsTreeForPost.getIn( [ 11, 'children' ] ).size ).to.equal( 0 );
		} );

		it( 'should be ordered by date in root and children lists', () => {
			const finalRes = buildCommentsTree( Immutable.fromJS( [
				{ ID: 11, parent: { ID: 9 }, text: 'eleven', date: '2016-01-31T10:07:18-08:00' },
				{ ID: 10, parent: { ID: 9 }, text: 'ten', date: '2016-01-29T10:07:18-08:00' },
				{ ID: 9, parent: { ID: 6 }, text: 'nine', date: '2016-01-28T11:07:18-08:00' },
				{ ID: 8, parent: false, text: 'eight', date: '2016-01-28T10:17:18-08:00' },
				{ ID: 7, parent: false, text: 'seven', date: '2016-01-28T10:08:18-08:00' },
				{ ID: 6, parent: false, text: 'six', date: '2016-01-28T10:07:18-08:00' }
			] )
			);

			// traverse the comments tree recursively and validate all the dates are in correct order
			const validateDates = ( childNodesList ) => {
				const actualDatesList = childNodesList.map( ( commentId ) => new Date( finalRes.getIn( [ commentId, 'data', 'date' ] ) ) );
				const sortedDatesList = actualDatesList.sort( ( a, b ) => a < b ); // earliest comment first

				const isListsEqual = actualDatesList.equals( sortedDatesList );

				if ( ! isListsEqual ) {
					// hint what are the nodes involved
					console.error( 'Bad child nodes', childNodesList );
				}

				expect( isListsEqual ).to.be.true;

				if ( isListsEqual ) {
					childNodesList.forEach( ( commentId ) => {
						validateDates( finalRes.getIn( [ commentId, 'children' ] ) );
					} );
				}
			};

			validateDates( finalRes.get( 'children' ) );
		} );
	} ); // end of buildCommentsTree

	describe( '#updateExistingIn()', () => {
		it( 'should modify only first item', () => {
			const list = Immutable.fromJS( [
				{ name: 'hello', data: 'one' },
				{ name: 'hello', data: 'one' }
			] );

			const newList = updateExistingIn( list,
				( el ) => el.get( 'name' ) === 'hello',
				( el ) => el.set( 'data', 'two' )
			);

			expect( newList.getIn( [ 0, 'data' ] ) ).to.equal( 'two' );
			expect( newList.getIn( [ 1, 'data' ] ) ).to.equal( 'one' );
		} );
	} );
} );
