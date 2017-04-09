/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isPrivateSite } from '../';

describe( 'isPrivateSite()', () => {
	it( 'should return null if neither the site nor settings are known', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: false
					}
				}
			},
			siteSettings: {
				items: {}
			}
		}, 2916285 );

		expect( isPrivate ).to.be.null;
	} );

	it( 'should prefer site state', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: true
					}
				}
			},
			siteSettings: {
				items: {
					2916284: {
						blog_public: 1
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.true;
	} );

	it( 'should fall back to settings state', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {}
			},
			siteSettings: {
				items: {
					2916284: {
						blog_public: 1
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.false;
	} );

	it( 'should return false for public sites', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: false
					}
				}
			},
			siteSettings: {
				items: {
					2916284: {
						blog_public: 1
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.false;
	} );

	it( 'should return true for private sites', () => {
		const isPrivate = isPrivateSite( {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: true
					}
				}
			},
			siteSettings: {
				items: {
					2916284: {
						blog_public: -1
					}
				}
			}
		}, 2916284 );

		expect( isPrivate ).to.be.true;
	} );
} );
