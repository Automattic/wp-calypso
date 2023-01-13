import { SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';
import {
	ABOUT_PAGE,
	CONTACT_PAGE,
	HOME_PAGE,
	PORTFOLIO_PAGE,
	VIDEO_GALLERY_PAGE,
	BLOG_PAGE,
	FAQ_PAGE,
	PHOTO_GALLERY_PAGE,
	PRICING_PAGE,
	SERVICES_PAGE,
	SHOP_PAGE,
	TEAM_PAGE,
	TESTIMONIALS_PAGE,
} from '../../../../../signup/difm/constants';
import {
	updateWebsiteContentCurrentIndex,
	mediaUploaded,
	websiteContentFieldChanged,
	initializeWebsiteContentForm,
	mediaUploadInitiated,
	mediaUploadFailed,
	logoUploadStarted,
	logoUploadFailed,
	logoUploadCompleted,
	mediaRemoved,
	logoRemoved,
	getSingleMediaPlaceholder,
} from '../actions';
import { initialState, LOGO_SECTION_ID, MEDIA_UPLOAD_STATES } from '../constants';
import websiteContentCollectionReducer from '../reducer';
import type { WebsiteContentCollectionState } from '../types';

const initialTestState: WebsiteContentCollectionState = {
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
};

const translatedPageTitles = {
	[ HOME_PAGE ]: 'Home',
	[ BLOG_PAGE ]: 'Blog',
	[ CONTACT_PAGE ]: 'Contact',
	[ ABOUT_PAGE ]: 'About',
	[ PHOTO_GALLERY_PAGE ]: 'Photo Gallery',
	[ VIDEO_GALLERY_PAGE ]: 'Video Gallery',
	[ PORTFOLIO_PAGE ]: 'Portfolio',
	[ FAQ_PAGE ]: 'FAQ',
	[ SERVICES_PAGE ]: 'Services',
	[ TESTIMONIALS_PAGE ]: 'Testimonials',
	[ PRICING_PAGE ]: 'Pricing',
	[ TEAM_PAGE ]: 'Team',
	[ SHOP_PAGE ]: 'Shop',
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

	test( 'State should be initialized correctly with no page content', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialState },
				initializeWebsiteContentForm(
					{
						selectedPageTitles: [ CONTACT_PAGE, VIDEO_GALLERY_PAGE, PORTFOLIO_PAGE ],
						isWebsiteContentSubmitted: false,
						isStoreFlow: false,
						pages: [],
						siteLogoUrl: '',
						genericFeedback: '',
					},
					translatedPageTitles
				)
			)
		).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: CONTACT_PAGE,
						title: 'Contact',
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
						title: 'Video Gallery',
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
						title: 'Portfolio',
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
		} );
	} );

	test( 'State should be initialized correctly with saved page content', () => {
		expect(
			websiteContentCollectionReducer(
				{ ...initialState },
				initializeWebsiteContentForm(
					{
						selectedPageTitles: [ CONTACT_PAGE, VIDEO_GALLERY_PAGE, PORTFOLIO_PAGE ],
						isWebsiteContentSubmitted: false,
						isStoreFlow: false,
						pages: [
							{
								id: CONTACT_PAGE,
								title: 'Contact',
								content: 'test contact page content',
								media: [ { url: 'test media url 1', mediaType: 'IMAGE' } ],
							},
							{
								id: VIDEO_GALLERY_PAGE,
								title: 'Video Gallery',
								content: 'test video gallery page content',
								media: [ { url: 'test media url 2', mediaType: 'VIDEO' } ],
							},
							{
								id: PORTFOLIO_PAGE,
								title: 'Portfolio',
								content: 'test portfolio page content',
								media: [ { url: 'test media url 3', mediaType: 'IMAGE' } ],
							},
						],
						siteLogoUrl: '',
						genericFeedback: '',
					},
					translatedPageTitles
				)
			)
		).toEqual( {
			...initialTestState,
			websiteContent: {
				...initialTestState.websiteContent,
				pages: [
					{
						id: CONTACT_PAGE,
						title: 'Contact',
						content: 'test contact page content',
						media: [
							{ url: 'test media url 1', mediaType: 'IMAGE' },
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
							getSingleMediaPlaceholder( 'IMAGE' ),
						],
					},
					{
						id: VIDEO_GALLERY_PAGE,
						title: 'Video Gallery',
						content: 'test video gallery page content',
						media: [
							{ url: 'test media url 2', mediaType: 'VIDEO' },
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
							getSingleMediaPlaceholder( 'VIDEO' ),
						],
					},
					{
						id: PORTFOLIO_PAGE,
						title: 'Portfolio',
						content: 'test portfolio page content',
						media: [
							{ url: 'test media url 3', mediaType: 'IMAGE' },
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
