import { SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';
import {
	ABOUT_PAGE,
	CONTACT_PAGE,
	HOME_PAGE,
	PORTFOLIO_PAGE,
	VIDEO_GALLERY_PAGE,
} from '../../../../../signup/difm/constants';
import {
	updateWebsiteContentCurrentIndex,
	mediaUploaded,
	websiteContentFieldChanged,
	initializePages,
	mediaUploadInitiated,
	mediaUploadFailed,
	logoUploadStarted,
	logoUploadFailed,
	logoUploadCompleted,
	mediaRemoved,
	logoRemoved,
	getSingleMediaPlaceholder,
} from '../actions';
import websiteContentCollectionReducer from '../reducer';
import {
	initialState,
	LOGO_SECTION_ID,
	MEDIA_UPLOAD_STATES,
	WebsiteContentCollection,
} from '../schema';

const initialTestState: WebsiteContentCollection = {
	currentIndex: 0,
	mediaUploadStates: {},
	websiteContent: {
		siteLogoSection: { siteLogoUrl: '' },
		feedbackSection: { genericFeedback: '' },
		pages: [
			{
				id: HOME_PAGE,
				title: 'Homepage',
				content: '',
				media: [
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
				],
			},
			{
				id: ABOUT_PAGE,
				title: 'Information About You',
				content: '',
				media: [
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
				],
			},
			{
				id: CONTACT_PAGE,
				title: 'Contact Info',
				content: '',
				media: [
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
					getSingleMediaPlaceholder( 'IMAGE' ),
				],
			},
		],
	},
	siteId: null,
};

describe( 'reducer', () => {
	test( 'should update the current index', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialTestState },
				updateWebsiteContentCurrentIndex( 5 )
			)
		).toEqual( {
			...initialTestState,
			currentIndex: 5,
		} );
	} );

	test( 'Initial page data should  be generated correctly', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialState },
				initializePages(
					[
						{
							id: CONTACT_PAGE,
							name: 'Page 1',
						},
						{
							id: VIDEO_GALLERY_PAGE,
							name: 'Page 2',
						},
						{
							id: PORTFOLIO_PAGE,
							name: 'Page 3',
						},
					],
					1234
				)
			)
		).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: CONTACT_PAGE,
						title: 'Page 1',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: VIDEO_GALLERY_PAGE,
						title: 'Page 2',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
						],
					},
					{
						id: PORTFOLIO_PAGE,
						title: 'Page 3',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
				],
			},
			siteId: 1234,
		} );
	} );

	test( 'When initializing page data existing page data should not be overwritten if the site id is same', () => {
		const existingState = {
			...initialState,
			siteId: 1234,
		};
		expect(
			websiteContentCollectionReducer(
				existingState,
				initializePages(
					[
						{
							id: CONTACT_PAGE,
							name: 'Page 1',
						},
						{
							id: VIDEO_GALLERY_PAGE,
							name: 'Page 2',
						},
						{
							id: PORTFOLIO_PAGE,
							name: 'Page 3',
						},
					],
					1234
				)
			)
		).toEqual( existingState );
	} );

	test( 'When initializing page data existing page data should be overwritten if the site id is different', () => {
		const existingState = {
			...initialState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: CONTACT_PAGE,
						title: 'Page 1',
						content: 'Some existing Page 1 content',
						media: [
							{ ...getSingleMediaPlaceholder( 'IMAGE' ), caption: 'sample.jpg', url: 'sample.jpg' },
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: VIDEO_GALLERY_PAGE,
						title: 'Page 2',
						content: 'Some existing Page 2 content',
						media: [
							{ ...getSingleMediaPlaceholder( 'IMAGE' ), caption: 'sample.vid', url: 'sample.vid' },
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
						],
					},
					{
						id: PORTFOLIO_PAGE,
						title: 'Page 3',
						content: 'Some existing Page 3 content',
						media: [
							{ caption: 'sample.jpg', url: 'sample.jpg' },
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
				],
			},
			siteId: 1234,
		};
		expect(
			websiteContentCollectionReducer(
				existingState,
				initializePages(
					[
						{
							id: CONTACT_PAGE,
							name: 'Page 1',
						},
						{
							id: VIDEO_GALLERY_PAGE,
							name: 'Page 2',
						},
						{
							id: PORTFOLIO_PAGE,
							name: 'Page 3',
						},
					],
					1337
				)
			)
		).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: CONTACT_PAGE,
						title: 'Page 1',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: VIDEO_GALLERY_PAGE,
						title: 'Page 2',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
						],
					},
					{
						id: PORTFOLIO_PAGE,
						title: 'Page 3',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
				],
			},
			siteId: 1337,
		} );
	} );

	test( 'image data should be accurately updated', () => {
		const action = mediaUploaded( {
			pageId: HOME_PAGE,
			mediaIndex: 1,
			media: {
				...getSingleMediaPlaceholder( 'IMAGE' ),
				caption: 'test',
				url: 'www.test.com/test.test.jpg',
			},
		} );
		const recieved = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( recieved ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ HOME_PAGE ]: {
					1: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: HOME_PAGE,
						title: 'Homepage',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							{
								...getSingleMediaPlaceholder( 'IMAGE' ),
								caption: 'test',
								url: 'www.test.com/test.test.jpg',
							},
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: ABOUT_PAGE,
						title: 'Information About You',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: CONTACT_PAGE,
						title: 'Contact Info',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
				],
			},
		} );
	} );

	test( 'should update the image uploading success/failed state correctly', () => {
		const action = mediaUploadInitiated( {
			pageId: ABOUT_PAGE,
			mediaIndex: 2,
		} );
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ ABOUT_PAGE ]: {
					2: MEDIA_UPLOAD_STATES.UPLOAD_STARTED,
				},
			},
		} );

		const failedAction = mediaUploadFailed( { pageId: ABOUT_PAGE, mediaIndex: 2 } );
		const nextAfterFailedState = websiteContentCollectionReducer(
			{ ...initialTestState },
			failedAction
		);
		expect( nextAfterFailedState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ ABOUT_PAGE ]: {
					2: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
				},
			},
		} );
	} );

	test( 'should remove the in memory image state details correctly', () => {
		// First simulate an image upload completion
		const actionmediaUploaded = mediaUploaded( {
			pageId: HOME_PAGE,
			mediaIndex: 0,
			media: {
				...getSingleMediaPlaceholder( 'IMAGE' ),
				caption: 'test',
				url: 'www.test.com/test.test.jpg',
			},
		} );
		const secondActionmediaUploaded = mediaUploaded( {
			pageId: HOME_PAGE,
			mediaIndex: 1,
			media: {
				...getSingleMediaPlaceholder( 'IMAGE' ),
				caption: 'secondtest',
				url: 'www.testwo.com/testwo.testwo.jpg',
			},
		} );

		let nextState = websiteContentCollectionReducer( { ...initialTestState }, actionmediaUploaded );
		nextState = websiteContentCollectionReducer( nextState, secondActionmediaUploaded );

		expect( nextState ).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: HOME_PAGE,
						title: 'Homepage',
						content: '',
						media: [
							{
								...getSingleMediaPlaceholder( 'IMAGE' ),
								caption: 'test',
								url: 'www.test.com/test.test.jpg',
							},
							{
								...getSingleMediaPlaceholder( 'IMAGE' ),
								caption: 'secondtest',
								url: 'www.testwo.com/testwo.testwo.jpg',
							},
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					...initialTestState.websiteContent.pages.slice( 1 ),
				],
			},
			mediaUploadStates: {
				[ HOME_PAGE ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
					1: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
		} );

		// Now remove the image and check state
		const actionRemoveInMemoryImage = mediaRemoved( {
			pageId: HOME_PAGE,
			mediaIndex: 1,
		} );
		nextState = websiteContentCollectionReducer( nextState, actionRemoveInMemoryImage );
		expect( nextState ).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: HOME_PAGE,
						title: 'Homepage',
						content: '',
						media: [
							{
								...getSingleMediaPlaceholder( 'IMAGE' ),
								caption: 'test',
								url: 'www.test.com/test.test.jpg',
							},
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					...initialTestState.websiteContent.pages.slice( 1 ),
				],
			},
			mediaUploadStates: {
				[ HOME_PAGE ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
					1: MEDIA_UPLOAD_STATES.UPLOAD_REMOVED,
				},
			},
		} );
	} );

	test( 'should update relevent state when the logo uploading is completed', () => {
		const action = logoUploadCompleted( 'wp.me/some-random-image.png' );
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				siteLogoSection: { siteLogoUrl: 'wp.me/some-random-image.png' },
			},
		} );
	} );

	test( 'should update the logo uploading started/failed state correctly', () => {
		const action = logoUploadStarted();
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_STARTED,
				},
			},
		} );

		const failedAction = logoUploadFailed();
		const nextAfterFailedState = websiteContentCollectionReducer(
			{ ...initialTestState },
			failedAction
		);
		expect( nextAfterFailedState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
				},
			},
		} );
	} );

	test( 'should update relevent state when in memory logo information is removed', () => {
		const action = logoRemoved();
		const nextState = websiteContentCollectionReducer( { ...initialTestState }, action );
		expect( nextState ).toEqual( {
			...initialTestState,
			mediaUploadStates: {
				[ LOGO_SECTION_ID ]: {
					0: MEDIA_UPLOAD_STATES.UPLOAD_REMOVED,
				},
			},
			websiteContent: {
				...initialTestState.websiteContent,
				siteLogoSection: { siteLogoUrl: '' },
			},
		} );
	} );

	test( 'text content should be accurately updated', () => {
		const action = websiteContentFieldChanged( {
			pageId: ABOUT_PAGE,
			fieldValue: 'Testing Content',
			fieldName: 'content',
		} );
		expect( websiteContentCollectionReducer( { ...initialTestState }, action ) ).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialState.websiteContent,
				pages: [
					{
						id: HOME_PAGE,
						title: 'Homepage',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: ABOUT_PAGE,
						title: 'Information About You',
						content: 'Testing Content',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: CONTACT_PAGE,
						title: 'Contact Info',
						content: '',
						media: [
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
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
		).toEqual( initialState );
	} );
} );
