import { expect } from 'chai';
import { SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';
import {
	updateWebsiteContentCurrentIndex,
	updateWebsiteContent,
	imageUploaded,
	textChanged,
	initializePages,
} from '../actions';
import websiteContentCollectionReducer from '../reducer';
import { initialState, initialTestState } from '../schema';

describe( 'reducer', () => {
	test( 'should update the current index', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialTestState },
				updateWebsiteContentCurrentIndex( 5 )
			)
		).to.be.eql( {
			...initialTestState,
			currentIndex: 5,
		} );
	} );

	test( 'Initial page data should  be generated correctly', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialState },
				initializePages( [
					{
						id: 'page-1',
						name: 'Page 1',
					},
					{
						id: 'page-2',
						name: 'Page 2',
					},
					{
						id: 'page-3',
						name: 'Page 3',
					},
				] )
			)
		).to.be.eql( {
			...initialTestState,
			websiteContent: [
				{
					id: 'page-1',
					title: 'Page 1',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-2',
					title: 'Page 2',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-3',
					title: 'Page 3',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
			],
		} );
	} );

	test( 'When initializing page data existing page data should not be overridden', () => {
		const existingState = {
			...initialState,
			websiteContent: [
				{
					id: 'page-1',
					title: 'Page 1',
					content: 'Some existing Page 1 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-2',
					title: 'Page 2',
					content: 'Some existing Page 2 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-3',
					title: 'Page 3',
					content: 'Some existing Page 3 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
			],
		};
		expect(
			websiteContentCollectionReducer(
				existingState,
				initializePages( [
					{
						id: 'page-2',
						name: 'Page 2',
					},
					{
						id: 'page-3',
						name: 'Page 3',
					},
					{
						id: 'page-4',
						name: 'Page 4',
					},
				] )
			)
		).to.be.eql( {
			...initialTestState,
			websiteContent: [
				{
					id: 'page-1',
					title: 'Page 1',
					content: 'Some existing Page 1 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-2',
					title: 'Page 2',
					content: 'Some existing Page 2 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-3',
					title: 'Page 3',
					content: 'Some existing Page 3 content',
					images: [
						{ caption: 'sample.jpg', url: 'sample.jpg' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'page-4',
					title: 'Page 4',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
			],
		} );
	} );

	test( 'should update home page content', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialTestState },
				updateWebsiteContent( [
					{
						id: 'Home',
						title: 'Home Page',
						content: 'Home Page Content',
						images: [ { caption: 'Screenshot 2', url: '/sp/url', uploadID: 5 } ],
					},
					{
						id: 'About',
						title: 'Information About You',
						content: '',
						images: [],
					},
					{
						id: 'Contact',
						title: 'Contact Info',
						content: '',
						images: [],
					},
				] )
			)
		).to.be.eql( {
			...initialTestState,
			websiteContent: [
				{
					id: 'Home',
					title: 'Home Page',
					content: 'Home Page Content',
					images: [ { caption: 'Screenshot 2', url: '/sp/url', uploadID: 5 } ],
				},
				{
					id: 'About',
					title: 'Information About You',
					content: '',
					images: [],
				},
				{
					id: 'Contact',
					title: 'Contact Info',
					content: '',
					images: [],
				},
			],
		} );
	} );

	test( 'image data should be accurately updated', () => {
		const action = imageUploaded( {
			id: 'Home',
			mediaIndex: 1,
			image: { caption: 'test', url: 'www.test.com/test.test.jpg' },
		} );
		const recieved = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( recieved ).to.be.eql( {
			...initialTestState,
			websiteContent: [
				{
					id: 'Home',
					title: 'Homepage',
					content: '',
					images: [
						{ caption: '', url: '' },
						{
							caption: 'test',
							url: 'www.test.com/test.test.jpg',
						},
						{ caption: '', url: '' },
					],
				},
				{
					id: 'About',
					title: 'Information About You',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'Contact',
					title: 'Contact Info',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
			],
		} );
	} );

	test( 'text content should be accurately updated', () => {
		const action = textChanged( {
			id: 'About',
			content: 'Testing Content',
		} );
		expect( websiteContentCollectionReducer( { ...initialTestState }, action ) ).to.be.eql( {
			...initialTestState,
			websiteContent: [
				{
					id: 'Home',
					title: 'Homepage',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'About',
					title: 'Information About You',
					content: 'Testing Content',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
				{
					id: 'Contact',
					title: 'Contact Info',
					content: '',
					images: [
						{ caption: '', url: '' },
						{ caption: '', url: '' },
						{ caption: '', url: '' },
					],
				},
			],
		} );
	} );

	test( 'should reset the state on signup complete', () => {
		expect(
			websiteContentCollectionReducer( initialTestState, {
				type: SIGNUP_COMPLETE_RESET,
				action: {},
			} )
		).to.be.eql( initialState );
	} );
} );
