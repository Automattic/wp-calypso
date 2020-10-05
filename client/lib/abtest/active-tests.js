/**
 * Note: this file is imported by `client` and `test/e2e` tests. `test/e2e` do not have the config
 * required to make aliased imports work (e.g. `import * from 'lib/'). As such, we must use relative
 * paths here (e.g. `import * from '../../lib/`)
 */

export default {
	cartNudgeUpdateToPremium: {
		datestamp: '20180917',
		variations: {
			test: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	springSale30PercentOff: {
		datestamp: '20180413',
		variations: {
			upsell: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	ATPromptOnCancel: {
		datestamp: '20170515',
		variations: {
			hide: 20,
			show: 80,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	skipThemesSelectionModal: {
		datestamp: '20170904',
		variations: {
			skip: 50,
			show: 50,
		},
		defaultVariation: 'show',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	builderReferralStatsNudge: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			googleMyBusinessBanner: 75,
		},
		defaultVariation: 'googleMyBusinessBanner',
	},
	builderReferralThemesBanner: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			original: 75,
		},
		defaultVariation: 'original',
	},
	pageBuilderMVP: {
		datestamp: '20190419',
		variations: {
			control: 100,
			test: 0,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	conciergeUpsellDial: {
		//this test is used to dial down the upsell offer
		datestamp: '20200910',
		variations: {
			offer: 75,
			noOffer: 25,
		},
		defaultVariation: 'noOffer',
		allowExistingUsers: true,
	},
	skippableDomainStep: {
		datestamp: '20290717',
		variations: {
			skippable: 0,
			notSkippable: 100,
		},
		defaultVariation: 'notSkippable',
		allowExistingUsers: true,
	},
	passwordlessSignup: {
		datestamp: '20291029',
		variations: {
			passwordless: 0,
			default: 100,
		},
		defaultVariation: 'default',
	},
	newSiteGutenbergOnboarding: {
		datestamp: '20200818',
		variations: {
			gutenberg: 0,
			control: 100,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
		localeTargets: [ 'en' ],
		countryCodeTargets: [
			'AE',
			'AL',
			'AR',
			'AU',
			'BD',
			'BR',
			'CN',
			'CO',
			'DE',
			'EG',
			'ES',
			'ET',
			'FI',
			'FR',
			'GB',
			'GE',
			'GH',
			'GR',
			'HK',
			'HR',
			'ID',
			'IE',
			'IL',
			'IN',
			'IT',
			'JM',
			'JP',
			'KE',
			'KH',
			'KR',
			'LK',
			'MM',
			'MX',
			'MV',
			'MY',
			'NG',
			'NL',
			'NP',
			'NP',
			'NZ',
			'PH',
			'PK',
			'PL',
			'QA',
			'RO',
			'RS',
			'RU',
			'SA',
			'SE',
			'SG',
			'TH',
			'TR',
			'TZ',
			'UA',
			'UG',
			'VN',
			'ZA',
		],
	},
	offerResetFlow: {
		datestamp: '20200916',
		variations: {
			showOfferResetFlow: 100,
			control: 0,
		},
		defaultVariation: 'showOfferResetFlow',
		allowExistingUsers: true,
	},
	userlessCheckout: {
		datestamp: '20210806',
		variations: {
			variantUserless: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
		countryCodeTargets: [ 'US', 'CA' ],
	},
	reskinSignupFlow: {
		datestamp: '20200928',
		variations: {
			reskinned: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
	},
	existingUsersGutenbergOnboard: {
		datestamp: '20200911',
		variations: {
			gutenberg: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
		localeTargets: [ 'en' ],
	},
	removeUsernameInSignup: {
		datestamp: '20201002',
		variations: {
			variantRemoveUsername: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
	},
	oneClickUpsell: {
		datestamp: '20200922',
		variations: {
			test: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
};
