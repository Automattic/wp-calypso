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
				updateWebsiteContent( [
					{
						titel: 'Home Page',
						content: 'Home Page Content',
						images: [ 'imgurl 1' ],
					},
					{
						title: 'About',
						content: '',
						images: [],
					},
					{
						title: 'Contact',
						content: '',
						images: [],
					},
				] )
			)
		).to.be.eql( {
			...initialState,
			websiteContent: [
				{
					titel: 'Home Page',
					content: 'Home Page Content',
					images: [ 'imgurl 1' ],
				},
				{
					title: 'About',
					content: '',
					images: [],
				},
				{
					title: 'Contact',
					content: '',
					images: [],
				},
			],
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
