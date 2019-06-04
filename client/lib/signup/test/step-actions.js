/** @format */

/**
 * Internal dependencies
 */
import { createSiteWithCart, isSiteTopicFulfilled } from '../step-actions';
import { useNock } from 'test/helpers/use-nock';
import flows from 'signup/config/flows';

// This is necessary since localforage will throw "no local storage method found" promise rejection without this.
// See how lib/user-settings/test apply the same trick.
jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/abtest', () => ( { abtest: () => '' } ) );

jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'signup/config/steps-pure', () => require( './mocks/signup/config/steps-pure' ) );
jest.mock( 'signup/config/flows', () => require( './mocks/signup/config/flows' ) );
jest.mock( 'signup/config/flows-pure', () => require( './mocks/signup/config/flows-pure' ) );

describe( 'createSiteWithCart()', () => {
	// createSiteWithCart() function is not designed to be easy for test at the moment.
	// Thus we intentionally mock the failing case here so that the parts we want to test
	// would be easier to write.
	useNock( nock => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( '/rest/v1.1/sites/new' )
			.reply( 400, function( uri, requestBody ) {
				return {
					error: 'error',
					message: 'something goes wrong!',
					requestBody,
				};
			} );
	} );

	test( 'should use the vertical field in the survey tree if the site topic one is empty.', () => {
		const vertical = 'foo topic';
		const fakeStore = {
			getState: () => ( {
				signup: {
					steps: {
						survey: {
							vertical,
						},
					},
				},
			} ),
		};

		createSiteWithCart(
			response => {
				expect( response.requestBody.options.site_vertical ).toBeUndefined();
			},
			[],
			[],
			fakeStore
		);
	} );

	test( 'should use the site topic state if it is not empty.', () => {
		const verticalId = 'meh';
		const siteTopicSlug = 'foo topic';
		const fakeStore = {
			getState: () => ( {
				signup: {
					steps: {
						siteType: 'blog',
						siteVertical: {
							id: verticalId,
							slug: siteTopicSlug,
						},
						survey: {
							vertical: 'should not use this',
						},
					},
				},
			} ),
		};

		createSiteWithCart(
			response => {
				expect( response.requestBody.options.site_vertical ).toEqual( verticalId );
			},
			[],
			[],
			fakeStore
		);
	} );
} );

describe( 'isSiteTopicFulfilled()', () => {
	const setSurvey = jest.fn();
	const submitSignupStep = jest.fn();
	const submitSiteVertical = jest.fn();

	beforeEach( () => {
		flows.excludeStep.mockClear();
		setSurvey.mockClear();
		submitSignupStep.mockClear();
		submitSiteVertical.mockClear();
	} );

	test( 'should remove a step fulfilled', () => {
		const flowName = 'flowWithSiteTopic';
		const stepName = 'site-topic';
		const initialContext = { query: { vertical: 'verticalSlug' } };
		const nextProps = { initialContext, flowName, submitSignupStep, submitSiteVertical, setSurvey };

		expect( flows.excludeStep ).not.toHaveBeenCalled();

		isSiteTopicFulfilled( stepName, undefined, nextProps );

		expect( flows.excludeStep ).toHaveBeenCalledWith( 'site-topic' );
	} );

	test( 'should not remove any step unfulfilled', () => {
		const flowName = 'flowWithSiteTopicAndTitle';
		const stepName = 'site-topic-and-title';
		const initialContext = { query: { vertical: 'verticalSlug' } };
		const nextProps = { initialContext, flowName, submitSignupStep, submitSiteVertical, setSurvey };

		expect( flows.excludeStep ).not.toHaveBeenCalled();

		isSiteTopicFulfilled( stepName, undefined, nextProps );

		expect( flows.excludeStep ).not.toHaveBeenCalled();
	} );

	test( 'should call both setSurvey() and submitSiteVertical() when vertical query param passed', () => {
		const flowName = 'flowWithSiteTopic';
		const stepName = 'site-topic';
		const initialContext = { query: { vertical: 'verticalSlug' } };
		const nextProps = { initialContext, flowName, submitSignupStep, submitSiteVertical, setSurvey };

		expect( setSurvey ).not.toHaveBeenCalled();
		expect( submitSiteVertical ).not.toHaveBeenCalled();

		isSiteTopicFulfilled( stepName, undefined, nextProps );

		expect( setSurvey ).toHaveBeenCalled();
		expect( submitSiteVertical ).toHaveBeenCalled();
	} );

	test( 'should call neither setSurvey() nor submitSiteVertical() when no vertical query param passed', () => {
		const flowName = 'flowWithSiteTopic';
		const stepName = 'site-topic';
		const initialContext = { query: {} };
		const nextProps = { initialContext, flowName, submitSiteVertical, setSurvey };

		expect( setSurvey ).not.toHaveBeenCalled();
		expect( submitSiteVertical ).not.toHaveBeenCalled();

		isSiteTopicFulfilled( stepName, undefined, nextProps );

		expect( setSurvey ).not.toHaveBeenCalled();
		expect( submitSiteVertical ).not.toHaveBeenCalled();
	} );

	test( 'should call neither setSurvey() nor submitSiteVertical() when the flow contains survey step', () => {
		const flowName = 'flowWithSiteTopicAndSurvey';
		const stepName = 'site-topic';
		const initialContext = { query: { vertical: 'verticalSlug' } };
		const nextProps = { initialContext, flowName, submitSiteVertical, setSurvey };

		expect( setSurvey ).not.toHaveBeenCalled();
		expect( submitSiteVertical ).not.toHaveBeenCalled();

		isSiteTopicFulfilled( stepName, undefined, nextProps );

		expect( setSurvey ).not.toHaveBeenCalled();
		expect( submitSiteVertical ).not.toHaveBeenCalled();
	} );
} );
