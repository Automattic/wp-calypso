/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSettings,
	isRequestingSettings,
	isSavingSettings,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingSettings()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the settings are not being requested', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							requesting: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the settings are being requested', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isSavingSettings()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					}
				}
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							saving: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, secondarySiteId );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return false if the settings are not being saved', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							saving: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return true if the settings are being saved', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							saving: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.true;
		} );
	} );

	describe( 'getSettings()', () => {
		const primarySettings = { job_manager_hide_expired: true };

		it( 'should return an empty object if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					}
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.deep.equal( {} );
		} );

		it( 'should return an empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							}
						}
					}
				}
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.deep.equal( {} );
		} );

		it( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							}
						}
					}
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.deep.equal( primarySettings );
		} );
	} );
} );
