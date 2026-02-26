import { JETPACK_PRODUCTS_LIST } from '@automattic/calypso-products';
import { TranslateResult, translate } from 'i18n-calypso';
import { DOWNGRADEABLE_PLANS_FROM_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

export interface CancellationReasonBase {
	/**
	 * A string value that will be reported.
	 */
	value: string;

	/**
	 * A string that will be displayed to the user.
	 */
	label: TranslateResult;

	/**
	 * Whether this option is disabled.
	 */
	disabled?: boolean;
}

export interface CancellationReason extends CancellationReasonBase {
	/**
	 * placeholder text for the additional input
	 */
	textPlaceholder?: TranslateResult;

	/**
	 * Default value for the sub category select
	 */
	selectInitialValue?: string;

	/**
	 * Default label for the sub category select
	 */
	selectLabel?: TranslateResult;

	/**
	 * Options for the sub category select
	 */
	selectOptions?: CancellationReason[];
}

/**
 * The reason always shown as the first option.
 */
export const PLACEHOLDER: CancellationReason = {
	value: '',
	get label() {
		return translate( 'Select your reason' );
	},
	disabled: true,
};

/**
 * The reason always shown at the end.
 */
export const LAST_REASON: CancellationReason = {
	value: 'anotherReasonOne',
	get label() {
		return translate( 'Another reason…' );
	},
	get textPlaceholder() {
		return translate( 'Why do you want to cancel?' );
	},
};

export const CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'price/budget',
		get label() {
			return translate( 'Too expensive' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooExpensive',
				get label() {
					return translate( 'The plan is too expensive for the features offered.' );
				},
			},
			{
				value: 'lackOfCustomization',
				get label() {
					return translate( 'Lack of customization features (e.g., colors, fonts, themes)' );
				},
			},
			{
				value: 'freeIsGoodEnough',
				get label() {
					return translate( 'The free plan is sufficient for my current needs' );
				},
			},
			{
				value: 'foundBetterValue',
				get label() {
					return translate( 'I found a competitor with better pricing/value' );
				},
			},
			{
				value: 'budgetConstraints',
				get label() {
					return translate( 'Budget constraints / Can no longer afford it' );
				},
			},
			{
				value: 'otherPriceValue',
				get label() {
					return translate( 'Something else related to price/value' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more about your price/value concern' );
				},
			},
		],
	},
	{
		value: 'tooHardToUse',
		get label() {
			return translate( 'Too hard to use' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'complicatedDashboard',
				get label() {
					return translate( 'The platform/dashboard is too complicated or confusing to navigate' );
				},
			},
			{
				value: 'difficultEditor',
				get label() {
					return translate( 'The website editor is difficult or unintuitive to use' );
				},
			},
			{
				value: 'tooMuchTimeToLearn',
				get label() {
					return translate( 'It takes too much time to learn how to use the platform' );
				},
			},
			{
				value: 'inadequateOnboarding',
				get label() {
					return translate( 'Onboarding or tutorials were not helpful enough' );
				},
			},
			{
				value: 'otherTooHardToUse',
				get label() {
					return translate( 'Something else related to too hard to use' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'missingFeatures',
		get label() {
			return translate( 'Missing features' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'cannotInstallPlugins',
				get label() {
					return translate(
						'Cannot install desired plugins (e.g., from WordPress.org or third-party)'
					);
				},
			},
			{
				value: 'cannotUploadThemes',
				get label() {
					return translate( 'Cannot upload custom themes' );
				},
			},
			{
				value: 'limitedCustomization',
				get label() {
					return translate(
						'Limited design or customization options (e.g., layout, specific elements)'
					);
				},
			},
			{
				value: 'missingFunctionality',
				get label() {
					return translate(
						'Lacking specific functionality I need (e.g., e-commerce, specific integrations, advanced SEO tools)'
					);
				},
			},
			{
				value: 'coreFeaturesMissing',
				get label() {
					return translate( 'Core features I expected are only available on a much higher plan' );
				},
			},
			{
				value: 'otherMissingFeatures',
				get label() {
					return translate( 'Something else related to features/flexibility' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'technicalIssues',
		get label() {
			return translate( 'Technical problems' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooSlow',
				get label() {
					return translate( 'Site is slow or experiences performance issues' );
				},
			},
			{
				value: 'bugsOrGlitches',
				get label() {
					return translate( 'Encountered bugs, errors, or glitches' );
				},
			},
			{
				value: 'migrationProblems',
				get label() {
					return translate( 'Problems migrating my existing site or content' );
				},
			},
			{
				value: 'downtime',
				get label() {
					return translate( 'Site was down or inaccessible' );
				},
			},
			{
				value: 'otherTechnicalIssues',
				get label() {
					return translate( 'Something else related to technical problems' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'domain',
		get label() {
			return translate( 'Problems with domain' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'troubleConnectingOrTransferring',
				get label() {
					return translate( 'Trouble connecting or transferring my existing domain' );
				},
			},
			{
				value: 'confusedAboutDomains',
				get label() {
					return translate( 'Confused about how domains work with the WordPress.com plan' );
				},
			},
			{
				value: 'domainIncorrect',
				get label() {
					return translate( 'Didn’t get the domain name I expected / My domain is incorrect' );
				},
			},
			{
				value: 'otherDomain',
				get label() {
					return translate( 'Something else related to domains' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'wrongPlanOrSite',
		get label() {
			return translate( 'Wrong plan or site' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'wrongPlan',
				get label() {
					return translate( 'I purchased this plan by mistake' );
				},
			},
			{
				value: 'wrongSite',
				get label() {
					return translate( 'I meant to upgrade a different website or account' );
				},
			},
			{
				value: 'noMatch',
				get label() {
					return translate( 'The plan I chose didn’t match what I thought I was buying' );
				},
			},
			{
				value: 'otherWrongPlanOrSite',
				get label() {
					return translate( 'Something else related to an accidental purchase' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'badSupport',
		get label() {
			return translate( 'Bad support experience' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'slowOrUnhelpful',
				get label() {
					return translate( 'Support was unhelpful or slow to respond' );
				},
			},
			{
				value: 'noHumanSupport',
				get label() {
					return translate( 'Could not easily reach a human support agent' );
				},
			},
			{
				value: 'AIInsufficient',
				get label() {
					return translate( 'AI/automated support was not sufficient for my issue' );
				},
			},
			{
				value: 'otherBadSupport',
				get label() {
					return translate( 'Something else related to support' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
	{
		value: 'noLongerNeedSite',
		get label() {
			return translate( 'No longer need a site' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'projectChanged',
				get label() {
					return translate( 'My project/business plans have changed' );
				},
			},
			{
				value: 'justExploring',
				get label() {
					return translate( 'I was just exploring/testing the platform' );
				},
			},
			{
				value: 'noLongerNeedSite',
				get label() {
					return translate( 'I no longer need this website/service' );
				},
			},
			{
				value: 'mayReturn',
				get label() {
					return translate( 'Temporary cancellation, I might return' );
				},
			},
			{
				value: 'otherNoLongerNeedSite',
				get label() {
					return translate( 'Something else related to changed needs' );
				},
				get textPlaceholder() {
					return translate( 'Please tell us more' );
				},
			},
		],
	},
];

export const JETPACK_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'didNotInclude',
		get label() {
			return translate( "This upgrade didn't include what I needed" );
		},
		get textPlaceholder() {
			return translate( 'What are we missing that you need?' );
		},
	},
	{
		value: 'onlyNeedFree',
		get label() {
			return translate( 'The plan was too expensive' );
		},
		get textPlaceholder() {
			return translate( 'How can we improve our upgrades?' );
		},
	},
	{
		value: 'couldNotActivate',
		get label() {
			return translate( 'I was unable to activate or use the product' );
		},
		get textPlaceholder() {
			return translate( 'Where did you run into problems?' );
		},
	},
];

export const DOMAIN_TRANSFER_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'noLongerWantToTransfer',
		get label() {
			return translate( 'I no longer want to transfer my domain.' );
		},
	},
	{
		value: 'couldNotCompleteTransfer',
		get label() {
			return translate( 'Something went wrong and I could not complete the transfer.' );
		},
	},
	{
		value: 'useDomainWithoutTransferring',
		get label() {
			return translate( 'I’m going to use my domain with WordPress.com without transferring it.' );
		},
	},
];

interface CancellationReasonsOptions {
	/**
	 * The slug of the product being removed.
	 */
	productSlug?: string;

	/**
	 * Previously selected sub value.
	 */
	prevSelectedSubOption?: string;
}

export function getCancellationReasons(
	reasonValues: string[],
	options: CancellationReasonsOptions = {}
): CancellationReason[] {
	const opts: CancellationReasonsOptions = {
		...options,
	};
	const reasons = [
		...CANCELLATION_REASONS,
		...JETPACK_CANCELLATION_REASONS,
		...DOMAIN_TRANSFER_CANCELLATION_REASONS,
		...getExtraJetpackReasons( opts ),
	];

	return [
		PLACEHOLDER,
		...reasons.filter( ( { value } ) => reasonValues.includes( value ) ),
		LAST_REASON,
	];
}

export function getExtraJetpackReasons(
	options: CancellationReasonsOptions = {}
): CancellationReason[] {
	if ( ! options.productSlug ) {
		return [];
	}

	// get all downgradable plans and products for downgrade question dropdown
	const downgradablePlans = DOWNGRADEABLE_PLANS_FROM_PLAN[ options.productSlug ];
	const downgradablePlansAndProductsSlug = [
		...( downgradablePlans || [] ),
		...JETPACK_PRODUCTS_LIST,
	];
	const downgradableSelectorProduct = downgradablePlansAndProductsSlug
		.map( slugToSelectorProduct )
		.filter( Boolean ) as SelectorProduct[];
	const selectOptions = downgradableSelectorProduct.map( ( product ) => ( {
		value: product.productSlug,
		label: translate( 'Jetpack %(planName)s', {
			args: { planName: product.shortName as string },
		} ),
	} ) ) as CancellationReasonBase[];

	selectOptions.unshift( {
		value: 'select_a_product',
		label: translate( 'Select a product' ),
		disabled: true,
	} );

	return [
		{
			value: 'downgradeToAnotherPlan',
			label: translate( "I'd like to downgrade to another plan." ),
			selectInitialValue: 'select_a_product',
			selectLabel: translate( 'Mind telling us which one?' ),
			selectOptions,
		},
	];
}
