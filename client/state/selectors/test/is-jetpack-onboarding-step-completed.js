/** @format */

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { isJetpackOnboardingStepCompleted } from 'state/selectors';

describe( 'isJetpackOnboardingStepCompleted()', () => {
	test( 'should return false for a null site ID', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
							siteDescription: 'Not just another amazing WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, null, STEPS.SITE_TITLE );

		expect( completed ).toBe( false );
	} );

	test( 'should return false if we have no settings for that site', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
							siteDescription: 'Not just another amazing WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 12345678, STEPS.SITE_TITLE );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for an unexisting step', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
							siteDescription: 'Not just another amazing WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, 'some-unexisting-step' );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for site title step if we have modified the site title', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
							siteDescription: 'Just another WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TITLE );

		expect( completed ).toBe( true );
	} );

	test( 'should return true for site title step if we have modified the site description', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: '',
							siteDescription: 'Not just another amazing WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TITLE );

		expect( completed ).toBe( true );
	} );

	test( 'should return false if site title and description have not been modified yet', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: '',
							siteDescription: 'Just another WordPress site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TITLE );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for site type step if we have selected the site type', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteType: 'personal',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TYPE );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for site type step if we have not selected the site type yet', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TYPE );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for site type step if site type is specified as not selected', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteType: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.SITE_TYPE );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for homepage step if we have selected the homepage format', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							homepageFormat: 'page',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.HOMEPAGE );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for homepage step if we have not selected the homepage format yet', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.HOMEPAGE );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for homepage step if we it is specified as not selected', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							homepageFormat: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.HOMEPAGE );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for contact form step if we have chosen to create a contact form', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							addContactForm: true,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.CONTACT_FORM );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for contact form step if we have not chosen to create a contact form', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.CONTACT_FORM );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for contact form step if it is specified as not selected', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							addContactForm: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.CONTACT_FORM );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for business address step if we have chosen to add a business address', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							businessAddress: [],
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.BUSINESS_ADDRESS );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for business address step if we have not added a business address', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.BUSINESS_ADDRESS );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for business address step if it is specified as not added yet', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							businessAddress: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.BUSINESS_ADDRESS );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for woocommerce step if we have chosen to install woocommerce', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							installWooCommerce: true,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.WOOCOMMERCE );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for woocommerce step if we have not installed/activated woocommerce', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.WOOCOMMERCE );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for woocommerce step if it is specified as not installed/activated yet', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							installWooCommerce: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.WOOCOMMERCE );

		expect( completed ).toBe( false );
	} );

	test( 'should return true for stats step if we have chosen to activate stats', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							stats: true,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.STATS );

		expect( completed ).toBe( true );
	} );

	test( 'should return false for stats step if we have not activated stats', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							siteTitle: 'My awesome site',
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.STATS );

		expect( completed ).toBe( false );
	} );

	test( 'should return false for stats step if it is specified as not activated', () => {
		const state = {
			jetpack: {
				settings: {
					2916284: {
						onboarding: {
							stats: false,
						},
					},
				},
			},
		};
		const completed = isJetpackOnboardingStepCompleted( state, 2916284, STEPS.STATS );

		expect( completed ).toBe( false );
	} );
} );
