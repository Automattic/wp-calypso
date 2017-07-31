/**
 * @jest-environment jsdom
 */
jest.mock( 'layout/guided-tours/config', () => {
	return require( 'state/ui/guided-tours/test/fixtures/config' );
} );
jest.mock( 'lib/user', () => () => {} );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	hasAnalyticsEventFired,
	hasUserPastedFromGoogleDocs,
	hasUserRegisteredBefore,
	isUserNewerThan
} from '../contexts';
import { EDITOR_PASTE_EVENT } from 'state/action-types';
import {
	SOURCE_GOOGLE_DOCS,
	SOURCE_UNKNOWN,
} from 'components/tinymce/plugins/wpcom-track-paste/sources';

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

describe( 'selectors', () => {
	let hasUserClicked;

	before( () => {
		hasUserClicked = hasAnalyticsEventFired( 'calypso_themeshowcase_theme_click' );
	} );

	describe( '#isUserNewerThan', () => {
		const oldUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: moment().subtract( 8, 'days' ) }
				}
			},
		};

		const newUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: moment() }
				}
			},
		};

		it( 'should return false for users registered before a week ago', () => {
			expect( isUserNewerThan( WEEK_IN_MILLISECONDS )( oldUser ) ).to.be.false;
		} );

		it( 'should return true for users registered in the last week', () => {
			expect( isUserNewerThan( WEEK_IN_MILLISECONDS )( newUser ) ).to.be.true;
		} );
	} );

	describe( '#hasUserRegisteredBefore', () => {
		const cutoff = new Date( '2015-10-18T17:14:52+00:00' );

		const oldUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: '2014-10-18T17:14:52+00:00' }
				}
			},
		};

		const newUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: '2016-10-18T17:14:52+00:00' }
				}
			},
		};

		it( 'should return true for users registered before the cut-off date', () => {
			expect( hasUserRegisteredBefore( cutoff )( oldUser ) ).to.be.true;
		} );

		it( 'should return false for users registered after the cut-off date', () => {
			expect( hasUserRegisteredBefore( cutoff )( newUser ) ).to.be.false;
		} );
	} );

	describe( '#hasUserPastedContentFromGoogleDocs', () => {
		it( 'should return false when no actions', () => {
			const state = {
				ui: {
					actionLog: []
				}
			};
			expect( hasUserPastedFromGoogleDocs( state ) ).to.be.false;
		} );

		it( 'should return false when last action is not the paste event', () => {
			const state = {
				ui: {
					actionLog: [
						{ type: EDITOR_PASTE_EVENT },
						{ type: 'NO_PASTE_EVENT' }
					]
				}
			};
			expect( hasUserPastedFromGoogleDocs( state ) ).to.be.false;
		} );

		it( 'should return true when last action is the paste event & the source is Google Docs', () => {
			const state = {
				ui: {
					actionLog: [
						{ type: 'NO_PASTE_EVENT' },
						{ type: EDITOR_PASTE_EVENT, source: SOURCE_GOOGLE_DOCS },
					]
				}
			};
			expect( hasUserPastedFromGoogleDocs( state ) ).to.be.true;
		} );

		it( 'should return false when last action is the paste event & the source is not Google Docs', () => {
			const state = {
				ui: {
					actionLog: [
						{ type: 'NO_PASTE_EVENT' },
						{ type: EDITOR_PASTE_EVENT, source: SOURCE_UNKNOWN },
					]
				}
			};
			expect( hasUserPastedFromGoogleDocs( state ) ).to.be.false;
		} );
	} );

	describe( '#hasAnalyticsEventFired', () => {
		it( 'should return false when no actions', () => {
			const state = {
				ui: {
					actionLog: []
				}
			};
			expect( hasUserClicked( state ) ).to.be.false;
		} );
		it( 'should return true when matching action', () => {
			const state = {
				ui: {
					actionLog: [ {
						type: 'ANALYTICS_EVENT_RECORD',
						meta: {
							analytics: [
								{
									type: 'ANALYTICS_EVENT_RECORD',
									payload: {
										service: 'tracks',
										name: 'calypso_themeshowcase_theme_click',
										properties: {}
									}
								}
							]
						}
					} ]
				}
			};
			expect( hasUserClicked( state ) ).to.be.true;
		} );
		it( 'should return false when mis-matching event', () => {
			const state = {
				ui: {
					actionLog: [ {
						type: 'ANALYTICS_EVENT_RECORD',
						meta: {
							analytics: [
								{
									type: 'ANALYTICS_EVENT_RECORD',
									payload: {
										service: 'tracks',
										name: 'wrong_name',
										properties: {}
									}
								}
							]
						}
					} ]
				}
			};
			expect( hasUserClicked( state ) ).to.be.false;
		} );
	} );
} );
