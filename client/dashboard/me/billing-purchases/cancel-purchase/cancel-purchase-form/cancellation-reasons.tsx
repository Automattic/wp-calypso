import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_NAMESERVERS, TRANSFER_DOMAIN_REGISTRATION } from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import * as React from 'react';

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;
// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

interface CancellationReasonBase {
	/**
	 * A string value that will be reported.
	 */
	value: string;

	/**
	 * A string that will be displayed to the user.
	 */
	label: string;

	/**
	 * Whether this option is disabled.
	 */
	disabled?: boolean;
}

interface CancellationReason extends CancellationReasonBase {
	/**
	 * placeholder text for the additional input
	 */
	textPlaceholder?: string;

	/**
	 * Options for the sub category select
	 */
	selectOptions?: CancellationReason[];

	/**
	 * Help links shown for the selection
	 */
	helpMessage?: TranslateResult;
}

/**
 * The reason always shown at the end.
 */
const LAST_REASON: CancellationReason = {
	value: 'anotherReasonOne',
	get label() {
		return __( 'Another reason…' );
	},
	get textPlaceholder() {
		return __( 'Why do you want to cancel?' );
	},
};

export const CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'price/budget',
		get label() {
			return __( 'Too expensive' );
		},
		selectOptions: [
			{
				value: 'tooExpensive',
				get label() {
					return __( 'The plan is too expensive for the features offered.' );
				},
			},
			{
				value: 'lackOfCustomization',
				get label() {
					return __( 'Lack of customization features (e.g., colors, fonts, themes)' );
				},
			},
			{
				value: 'freeIsGoodEnough',
				get label() {
					return __( 'The free plan is sufficient for my current needs' );
				},
			},
			{
				value: 'foundBetterValue',
				get label() {
					return __( 'I found a competitor with better pricing/value' );
				},
			},
			{
				value: 'budgetConstraints',
				get label() {
					return __( 'Budget constraints / Can no longer afford it' );
				},
			},
			{
				value: 'otherPriceValue',
				get label() {
					return __( 'Something else related to price/value' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more about your price/value concern' );
				},
			},
		],
	},
	{
		value: 'tooHardToUse',
		get label() {
			return __( 'Too hard to use' );
		},
		selectOptions: [
			{
				value: 'complicatedDashboard',
				get label() {
					return __( 'The platform/dashboard is too complicated or confusing to navigate' );
				},
			},
			{
				value: 'difficultEditor',
				get label() {
					return __( 'The website editor is difficult or unintuitive to use' );
				},
			},
			{
				value: 'tooMuchTimeToLearn',
				get label() {
					return __( 'It takes too much time to learn how to use the platform' );
				},
			},
			{
				value: 'inadequateOnboarding',
				get label() {
					return __( 'Onboarding or tutorials were not helpful enough' );
				},
			},
			{
				value: 'otherTooHardToUse',
				get label() {
					return __( 'Something else related to too hard to use' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'missingFeatures',
		get label() {
			return __( 'Missing features' );
		},
		selectOptions: [
			{
				value: 'cannotInstallPlugins',
				get label() {
					return __( 'Cannot install desired plugins (e.g., from WordPress.org or third-party)' );
				},
			},
			{
				value: 'cannotUploadThemes',
				get label() {
					return __( 'Cannot upload custom themes' );
				},
			},
			{
				value: 'limitedCustomization',
				get label() {
					return __( 'Limited design or customization options (e.g., layout, specific elements)' );
				},
			},
			{
				value: 'missingFunctionality',
				get label() {
					return __(
						'Lacking specific functionality I need (e.g., e-commerce, specific integrations, advanced SEO tools)'
					);
				},
			},
			{
				value: 'coreFeaturesMissing',
				get label() {
					return __( 'Core features I expected are only available on a much higher plan' );
				},
			},
			{
				value: 'otherMissingFeatures',
				get label() {
					return __( 'Something else related to features/flexibility' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'technicalIssues',
		get label() {
			return __( 'Technical problems' );
		},
		selectOptions: [
			{
				value: 'tooSlow',
				get label() {
					return __( 'Site is slow or experiences performance issues' );
				},
			},
			{
				value: 'bugsOrGlitches',
				get label() {
					return __( 'Encountered bugs, errors, or glitches' );
				},
			},
			{
				value: 'migrationProblems',
				get label() {
					return __( 'Problems migrating my existing site or content' );
				},
			},
			{
				value: 'downtime',
				get label() {
					return __( 'Site was down or inaccessible' );
				},
			},
			{
				value: 'otherTechnicalIssues',
				get label() {
					return __( 'Something else related to technical problems' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'domain',
		get label() {
			return __( 'Problems with domain' );
		},
		selectOptions: [
			{
				value: 'troubleConnectingOrTransferring',
				get label() {
					return __( 'Trouble connecting or transferring my existing domain' );
				},
			},
			{
				value: 'confusedAboutDomains',
				get label() {
					return __( 'Confused about how domains work with the WordPress.com plan' );
				},
			},
			{
				value: 'domainIncorrect',
				get label() {
					return __( 'Didn’t get the domain name I expected / My domain is incorrect' );
				},
			},
			{
				value: 'otherDomain',
				get label() {
					return __( 'Something else related to domains' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'wrongPlanOrSite',
		get label() {
			return __( 'Wrong plan or site' );
		},
		selectOptions: [
			{
				value: 'wrongPlan',
				get label() {
					return __( 'I purchased this plan by mistake' );
				},
			},
			{
				value: 'wrongSite',
				get label() {
					return __( 'I meant to upgrade a different website or account' );
				},
			},
			{
				value: 'noMatch',
				get label() {
					return __( 'The plan I chose didn’t match what I thought I was buying' );
				},
			},
			{
				value: 'otherWrongPlanOrSite',
				get label() {
					return __( 'Something else related to an accidental purchase' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'badSupport',
		get label() {
			return __( 'Bad support experience' );
		},
		selectOptions: [
			{
				value: 'slowOrUnhelpful',
				get label() {
					return __( 'Support was unhelpful or slow to respond' );
				},
			},
			{
				value: 'noHumanSupport',
				get label() {
					return __( 'Could not easily reach a human support agent' );
				},
			},
			{
				value: 'AIInsufficient',
				get label() {
					return __( 'AI/automated support was not sufficient for my issue' );
				},
			},
			{
				value: 'otherBadSupport',
				get label() {
					return __( 'Something else related to support' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'noLongerNeedSite',
		get label() {
			return __( 'No longer need a site' );
		},
		selectOptions: [
			{
				value: 'projectChanged',
				get label() {
					return __( 'My project/business plans have changed' );
				},
			},
			{
				value: 'justExploring',
				get label() {
					return __( 'I was just exploring/testing the platform' );
				},
			},
			{
				value: 'noLongerNeedSite',
				get label() {
					return __( 'I no longer need this website/service' );
				},
			},
			{
				value: 'mayReturn',
				get label() {
					return __( 'Temporary cancellation, I might return' );
				},
			},
			{
				value: 'otherNoLongerNeedSite',
				get label() {
					return __( 'Something else related to changed needs' );
				},
				get textPlaceholder() {
					return __( 'Please tell us more' );
				},
			},
		],
	},
];

export const JETPACK_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'onlyNeedFree',
		get label() {
			return __( 'The plan was too expensive' );
		},
		get textPlaceholder() {
			return __( 'How can we improve our upgrades?' );
		},
	},
	{
		value: 'wantToDowngrade',
		get label() {
			return __( "I'd like to downgrade to another plan." );
		},
		get textPlaceholder() {
			return __( 'Please tell us more' );
		},
	},
	{
		value: 'didNotInclude',
		get label() {
			return __( "This upgrade didn't include what I needed" );
		},
		get textPlaceholder() {
			return __( 'What are we missing that you need?' );
		},
	},
	{
		value: 'couldNotActivate',
		get label() {
			return __( 'I was unable to activate or use the product' );
		},
		get textPlaceholder() {
			return __( 'Where did you run into problems?' );
		},
	},
	{
		value: 'dontNeedWebsite',
		get label() {
			return __( 'I no longer need a website.' );
		},
		get textPlaceholder() {
			return __( 'Please tell us more' );
		},
	},
	{
		value: 'couldNotGetSupport',
		get label() {
			return __( "I couldn't get the support I needed." );
		},
		get textPlaceholder() {
			return __( 'Please tell us more' );
		},
	},
];

export const DOMAIN_TRANSFER_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'noLongerWantToTransfer',
		get label() {
			return __( 'I no longer want to transfer my domain.' );
		},
	},
	{
		value: 'couldNotCompleteTransfer',
		get label() {
			return __( 'Something went wrong and I could not complete the transfer.' );
		},
	},
	{
		value: 'useDomainWithoutTransferring',
		get label() {
			return __( 'I’m going to use my domain with WordPress.com without transferring it.' );
		},
	},
];

export const DOMAIN_REGISTRATION_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'misspelled',
		get label() {
			return __( 'I misspelled the domain' );
		},
		selectOptions: [],
	},
	{
		value: 'otherHost',
		get label() {
			return __( 'I want to use the domain with another service or host' );
		},
		helpMessage: createInterpolateElement(
			__(
				'Canceling a domain name causes the domain to become unavailable for a brief period. ' +
					'Afterward, anyone can repurchase. If you wish to use the domain with another service, ' +
					'you’ll want to <a>update your name servers</a> instead.'
			),
			{
				a: (
					<a href={ localizeUrl( UPDATE_NAMESERVERS ) } target="_blank" rel="noopener noreferrer" />
				),
			}
		),
	},
	{
		value: 'transfer',
		get label() {
			return __( 'I want to transfer my domain to another registrar' );
		},
		helpMessage: createInterpolateElement(
			__(
				'Canceling a domain name may cause the domain to become unavailable for a long time before it ' +
					'can be purchased again, and someone may purchase it before you get a chance. Instead, ' +
					'please <a>use our transfer out feature</a> if you want to use this domain again in the future.'
			),
			{
				a: (
					<a
						href={ localizeUrl( TRANSFER_DOMAIN_REGISTRATION ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			}
		),
	},
	{
		value: 'expectations',
		get label() {
			return __( "The service isn't what I expected" );
		},
		helpMessage: __(
			'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
				'and you might want to consider keeping the misspelled domain.'
		),
	},
	{
		value: 'wantedFree',
		get label() {
			return __( 'I meant to get a free blog' );
		},
		get textPlaceholder() {
			return __( 'Please tell us more' );
		},
	},
	{
		value: 'other',
		get label() {
			return __( 'Something not listed here' );
		},
		get textPlaceholder() {
			return __( 'Please tell us more' );
		},
	},
];

export const GSUITE_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'tooExpensive',
		get label() {
			return __( "It's too expensive." );
		},
	},
	{
		value: 'doNotNeedIt',
		get label() {
			return __( "I don't need it." );
		},
		get textPlaceholder() {
			return __( 'What are we missing that you need?' );
		},
	},
	{
		value: 'purchasedByMistake',
		get label() {
			return __( 'I purchased it by mistake.' );
		},
	},
	{
		value: 'itDidNotWork',
		get label() {
			return __( 'I was unable to activate or use it.' );
		},
		get textPlaceholder() {
			return __( 'Where did you run into problems?' );
		},
	},
];

export function getCancellationReasons( reasonValues: string[] ): CancellationReason[] {
	const reasons = [
		...CANCELLATION_REASONS,
		...JETPACK_CANCELLATION_REASONS,
		...GSUITE_CANCELLATION_REASONS,
		...DOMAIN_TRANSFER_CANCELLATION_REASONS,
		...DOMAIN_REGISTRATION_CANCELLATION_REASONS,
	];

	return [ ...reasons.filter( ( { value } ) => reasonValues.includes( value ) ), LAST_REASON ];
}
