/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getGuidedTransferIssue,
	isGuidedTransferAvailableForAllSites,
	isRequestingGuidedTransferStatus,
	isGuidedTransferSavingHostDetails,
} from '../selectors';

describe( 'selectors', () => {
	const testSiteId = 100658273;

	describe( '#isRequestingGuidedTransferStatus()', () => {
		it( 'should return false for default state {}', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.false;
		} );

		it( 'should return true when a request is underway', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {
							1: false,
							[ testSiteId ]: true,
						},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.true;
		} );


		it( 'should return false when a isFetching is false', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {
							1: true,
							[ testSiteId ]: false,
						},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.false;
		} );
	} );

	describe( '#getGuidedTransferIssue()', () => {
		it( 'should return a single issue when no options specified', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [
						{ reason: 'something' },
						{ reason: 'something-else' },
					] }
				} } }
			} );
			expect( getGuidedTransferIssue( state, testSiteId ) ).to.eql(
				{ reason: 'something' }
			);
		} );

		it( 'should return the first issue with given options', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [
						{ reason: 'something-else', prevents_transfer: true },
						{ reason: 'something-blocking', prevents_transfer: true },
						{ reason: 'something-not-blocking', prevents_transfer: false },
					] }
				} } }
			} );

			expect( getGuidedTransferIssue( state, testSiteId, { reason: 'something-blocking', prevents_transfer: true } ) ).to.eql(
				{ reason: 'something-blocking', prevents_transfer: true }
			);

			expect( getGuidedTransferIssue( state, testSiteId, { reason: 'something-blocking' } ) ).to.eql(
				{ reason: 'something-blocking', prevents_transfer: true }
			);

			expect( getGuidedTransferIssue( state, testSiteId, { prevents_transfer: true } ) ).to.eql(
				{ reason: 'something-else', prevents_transfer: true }
			);

			expect( getGuidedTransferIssue( state, testSiteId, { prevents_transfer: false } ) ).to.eql(
				{ reason: 'something-not-blocking', prevents_transfer: false }
			);
		} );
	} );

	describe( '#isGuidedTransferAvailableForAllSites()', () => {
		it( 'should return false when unavailable', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [
						{ reason: 'unavailable', prevents_transfer: true },
					] }
				} } }
			} );
			expect( isGuidedTransferAvailableForAllSites( state, testSiteId ) ).to.be.false;
		} );

		it( 'should return false when on vacation', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [
						{ reason: 'vacation', prevents_transfer: true },
					] }
				} } }
			} );
			expect( isGuidedTransferAvailableForAllSites( state, testSiteId ) ).to.be.false;
		} );

		it( 'should return true when no issues', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [ ] }
				} } }
			} );
			expect( isGuidedTransferAvailableForAllSites( state, testSiteId ) ).to.be.true;
		} );

		it( 'should return true when theres only a site specific issue', () => {
			const state = deepFreeze( {
				sites: { guidedTransfer: { status: {
					[ testSiteId ]: { issues: [
						{ reason: 'premium-theme', prevents_transfer: true },
					] }
				} } }
			} );
			expect( isGuidedTransferAvailableForAllSites( state, testSiteId ) ).to.be.true;

	describe( '#isGuidedTransferSavingHostDetails()', () => {
		it( 'should return false for default state {}', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isSaving: {},
					}
				}
			} );

			expect( isGuidedTransferSavingHostDetails( state, testSiteId ) ).to.be.false;
		} );

		it( 'should return true when a request is underway', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isSaving: {
							1: false,
							[ testSiteId ]: true,
						},
					}
				}
			} );

			expect( isGuidedTransferSavingHostDetails( state, testSiteId ) ).to.be.true;
		} );

		it( 'should return false when a isFetching is false', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isSaving: {
							1: true,
							[ testSiteId ]: false,
						},
					}
				}
			} );

			expect( isGuidedTransferSavingHostDetails( state, testSiteId ) ).to.be.false;
		} );
	} );
} );
