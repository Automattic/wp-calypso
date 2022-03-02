import { expect } from 'chai';
import { SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';
import {
	updateWebsiteContentCurrentIndex,
	imageUploaded,
	textChanged,
	initializePages,
	imageUploadInitiated,
	imageUploadFailed,
	logoUploadStarted,
	logoUploadFailed,
	logoUploadCompleted,
	imageRemoved,
	removeUploadedLogoUrl,
} from '../actions';
import websiteContentCollectionReducer, { IMAGE_UPLOAD_STATES, LOGO_SECTION_ID } from '../reducer';
import { initialState } from '../schema';

const initialTestState = {
	currentIndex: 0,
	imageUploadStates: {},
	websiteContent: {
		siteLogoUrl: '',
		pages: [
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
	},
};

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
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
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
			},
		} );
	} );

	test( 'When initializing page data existing page data should not be overridden', () => {
		const existingState = {
			...initialState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
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
			},
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
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
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
			},
		} );
	} );

	test( 'image data should be accurately updated', () => {
		const action = imageUploaded( {
			pageId: 'Home',
			mediaIndex: 1,
			image: { caption: 'test', url: 'www.test.com/test.test.jpg' },
		} );
		const recieved = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( recieved ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				Home: {
					1: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
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
			},
		} );
	} );

	test( 'should update the image uploading success/failed state correctly', () => {
		const action = imageUploadInitiated( {
			pageId: 'About',
			mediaIndex: 2,
		} );
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				About: {
					2: IMAGE_UPLOAD_STATES.UPLOAD_STARTED,
				},
			},
		} );

		const failedAction = imageUploadFailed( { pageId: 'About', mediaIndex: 2 } );
		const nextAfterFailedState = websiteContentCollectionReducer(
			{ ...initialTestState },
			failedAction
		);
		expect( nextAfterFailedState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				About: {
					2: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
				},
			},
		} );
	} );

	test( 'should remove the in memory image state details correctly', () => {
		// First simulate an image upload completion
		const actionImageUploaded = imageUploaded( {
			pageId: 'Home',
			mediaIndex: 0,
			image: { caption: 'test', url: 'www.test.com/test.test.jpg' },
		} );
		const secondActionImageUploaded = imageUploaded( {
			pageId: 'Home',
			mediaIndex: 1,
			image: { caption: 'secondtest', url: 'www.testwo.com/testwo.testwo.jpg' },
		} );

		let nextState = websiteContentCollectionReducer( { ...initialTestState }, actionImageUploaded );
		nextState = websiteContentCollectionReducer( nextState, secondActionImageUploaded );

		expect( nextState ).to.be.eql( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: 'Home',
						title: 'Homepage',
						content: '',
						images: [
							{
								caption: 'test',
								url: 'www.test.com/test.test.jpg',
							},
							{
								caption: 'secondtest',
								url: 'www.testwo.com/testwo.testwo.jpg',
							},
							{ caption: '', url: '' },
						],
					},
					...initialTestState.websiteContent.pages.slice( 1 ),
				],
			},
			imageUploadStates: {
				Home: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
					1: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
		} );

		// Now remove the image and check state
		const actionRemoveInMemoryImage = imageRemoved( {
			pageId: 'Home',
			mediaIndex: 1,
		} );
		nextState = websiteContentCollectionReducer( nextState, actionRemoveInMemoryImage );
		expect( nextState ).to.be.eql( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: 'Home',
						title: 'Homepage',
						content: '',
						images: [
							{
								caption: 'test',
								url: 'www.test.com/test.test.jpg',
							},
							{
								caption: '',
								url: '',
							},
							{ caption: '', url: '' },
						],
					},
					...initialTestState.websiteContent.pages.slice( 1 ),
				],
			},
			imageUploadStates: {
				Home: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
					1: IMAGE_UPLOAD_STATES.UPLOAD_REMOVED,
				},
			},
		} );
	} );

	test( 'should update relevent state when the logo uploading is completed', () => {
		const action = logoUploadCompleted( 'wp.me/some-random-image.png' );
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				siteLogoUrl: 'wp.me/some-random-image.png',
			},
		} );
	} );

	test( 'should update the logo uploading started/failed state correctly', () => {
		const action = logoUploadStarted();
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_STARTED,
				},
			},
		} );

		const failedAction = logoUploadFailed();
		const nextAfterFailedState = websiteContentCollectionReducer(
			{ ...initialTestState },
			failedAction
		);
		expect( nextAfterFailedState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
				},
			},
		} );
	} );

	test( 'should update relevent state when in memory logo information is removed', () => {
		const action = removeUploadedLogoUrl();
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).to.be.eql( {
			...initialTestState,
			imageUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: IMAGE_UPLOAD_STATES.UPLOAD_REMOVED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				siteLogoUrl: '',
			},
		} );
	} );

	test( 'text content should be accurately updated', () => {
		const action = textChanged( {
			pageId: 'About',
			content: 'Testing Content',
		} );
		expect( websiteContentCollectionReducer( { ...initialTestState }, action ) ).to.be.eql( {
			...initialTestState,
			websiteContent: {
				...initialState.websiteContent,
				pages: [
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
			},
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
