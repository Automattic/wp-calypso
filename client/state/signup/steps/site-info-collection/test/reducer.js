import { expect } from 'chai';
import {
	SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
	SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import signupSiteInfoCollectionReducer from '../reducer';
import { initialState } from '../schema';

describe( 'reducer', () => {
	test( 'should update the current index', () => {
		expect(
			signupSiteInfoCollectionReducer(
				{ currentIndex: 0 },
				{
					type: SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX,
					currentIndex: 1,
				}
			)
		).to.be.eql( {
			currentIndex: 1,
		} );
	} );

	test( 'should update the site title', () => {
		expect(
			signupSiteInfoCollectionReducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
					data: {
						siteTitle: 'test-site-title',
					},
				}
			)
		).to.be.eql( {
			siteTitle: 'test-site-title',
		} );
	} );

	test( 'should reset the state on signup complete', () => {
		expect(
			signupSiteInfoCollectionReducer(
				{
					siteTitle: 'test-site-title',
				},
				{
					type: SIGNUP_COMPLETE_RESET,
					action: {},
				}
			)
		).to.be.eql( initialState );
	} );
} );
