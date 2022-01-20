import { expect } from 'chai';
import { SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';
import { updateWebsiteContentCurrentIndex, updateWebsiteContent } from '../actions';
import websiteContentCollectionReducer from '../reducer';
import { initialState } from '../schema';

describe( 'reducer', () => {
	test( 'should update the current index', () => {
		expect(
			websiteContentCollectionReducer( initialState, updateWebsiteContentCurrentIndex( 5 ) )
		).to.be.eql( {
			...initialState,
			currentIndex: 5,
		} );
	} );

	test( 'should update home page cntent', () => {
		expect(
			websiteContentCollectionReducer(
				initialState,
				updateWebsiteContent( { homePage: { content: 'Home Page Content' } } )
			)
		).to.be.eql( {
			...initialState,
			websiteContent: { homePage: { content: 'Home Page Content' } },
		} );
	} );

	test( 'should reset the state on signup complete', () => {
		expect(
			websiteContentCollectionReducer( initialState, {
				type: SIGNUP_COMPLETE_RESET,
				action: {},
			} )
		).to.be.eql( initialState );
	} );
} );
