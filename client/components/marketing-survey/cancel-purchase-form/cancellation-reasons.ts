import { JETPACK_PRODUCTS_LIST } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { DOWNGRADEABLE_PLANS_FROM_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { ReactChild } from 'react';

type TranslateReturnType = ReactChild | string;

export interface CancellationReasonBase {
	/**
	 * A string value that will be reported.
	 */
	value: string;

	/**
	 * A string that will be displayed to the user.
	 */
	label: TranslateReturnType;

	/**
	 * Whether this option is disabled.
	 */
	disabled?: boolean;
}

export interface CancellationReason extends CancellationReasonBase {
	/**
	 * placeholder text for the additional input
	 */
	textPlaceholder?: TranslateReturnType;

	/**
	 * Default value for the sub category select
	 */
	selectInitialValue?: string;

	/**
	 * Default label for the sub category select
	 */
	selectLabel?: TranslateReturnType;

	/**
	 * Options for the sub category select
	 */
	selectOptions?: CancellationReasonBase[];
}

/**
 * The reason always shown as the first option.
 */
export const PLACEHOLDER: CancellationReason = {
	value: '',
	label: translate( 'Select your reason' ),
	disabled: true,
};

/**
 * The reason always shown at the end.
 */
export const LAST_REASON: CancellationReason = {
	value: 'anotherReasonOne',
	label: translate( 'Another reason…' ),
	textPlaceholder: translate( 'Can you please specify?' ),
};

export const CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'price/budget',
		label: translate( 'Price/Budget' ),
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooExpensive',
				label: translate( 'It’s too expensive.' ),
			},
			{
				value: 'wantCheaperPlan',
				label: translate( 'I want a cheaper plan.' ),
			},
			{
				value: 'freeIsGoodEnough',
				label: translate( 'Free is good enough for me.' ),
			},
		],
	},
	{
		value: 'couldNotFinish',
		label: translate( 'Couldn’t finish my site' ),
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'noTime',
				label: translate( 'I don’t have time.' ),
			},
			{
				value: 'needProfessionalHelp',
				label: translate( 'Need professional help to build my site.' ),
			},
			{
				value: 'siteIsNotReady',
				label: translate( 'My site is not ready.' ),
			},
			{
				value: 'cannotFindWhatIWanted',
				label: translate( 'Couldn’t find what I wanted.' ),
			},
		],
	},
	{
		value: 'missingFeatures',
		label: translate( 'Missing features' ),
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'otherFeatures',
				label: translate( 'Other features' ),
			},
			{
				value: 'eCommerceFeatures',
				label: translate( 'eCommerce features' ),
			},
			{
				value: 'customization',
				label: translate( 'Customization / CSS' ),
			},
			{
				value: 'cannotUsePlugin',
				label: translate( 'Can’t use a plugin' ),
			},
			{
				value: 'cannotUseTheme',
				label: translate( 'Can’t use a theme' ),
			},
			{
				value: 'loadingTime',
				label: translate( 'Loading time' ),
			},
		],
	},
	{
		value: 'technicalIssues',
		label: translate( 'Technical issues' ),
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooComplicated',
				label: translate( 'It’s too complicated for me.' ),
			},
			{
				value: 'seoIssues',
				label: translate( 'SEO issues' ),
			},
			{
				value: 'loadingTime',
				label: translate( 'Loading time' ),
			},
		],
	},
	{
		value: 'domain',
		label: translate( 'Domain' ),
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'didNotGetFreeDomain',
				label: translate( 'I didn’t get a free domain.' ),
			},
			{
				value: 'otherDomainIssues',
				label: translate( 'Other domain issues' ),
			},
			{
				value: 'domainConnection',
				label: translate( 'Problem connecting my domain' ),
			},
		],
	},
];

export const JETPACK_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'didNotInclude',
		label: translate( "This upgrade didn't include what I needed." ),
		textPlaceholder: translate( 'What are we missing that you need?' ),
	},
	{
		value: 'onlyNeedFree',
		label: translate( 'The plan was too expensive.' ),
		textPlaceholder: translate( 'How can we improve our upgrades?' ),
	},
	{
		value: 'couldNotActivate',
		label: translate( 'I was unable to activate or use the product.' ),
		textPlaceholder: translate( 'Where did you run into problems?' ),
	},
];

export const DOMAIN_TRANSFER_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'noLongerWantToTransfer',
		label: translate( 'I no longer want to transfer my domain.' ),
	},
	{
		value: 'couldNotCompleteTransfer',
		label: translate( 'Something went wrong and I could not complete the transfer.' ),
	},
	{
		value: 'useDomainWithoutTransferring',
		label: translate( 'I’m going to use my domain with WordPress.com without transferring it.' ),
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
