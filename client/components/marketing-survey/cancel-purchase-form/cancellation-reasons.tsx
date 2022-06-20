import { JETPACK_PRODUCTS_LIST } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { TRANSFER_DOMAIN_REGISTRATION, UPDATE_NAMESERVERS } from 'calypso/lib/url/support';
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
	 * Whether the additional input is required.
	 */
	isTextRequired?: boolean;

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

	/**
	 * Text to show after a reason has been selected to provide additional help
	 */
	helpMessage?: TranslateReturnType;

	/**
	 * Whether the reason blocks the next step (effectively blocking the cancellation).
	 */
	isNextStepBlocked?: boolean;
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
		return translate( 'Can you please specify?' );
	},
	isTextRequired: true,
};

export const CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'price/budget',
		get label() {
			return translate( 'Price/Budget' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooExpensive',
				get label() {
					return translate( 'It’s too expensive.' );
				},
			},
			{
				value: 'wantCheaperPlan',
				get label() {
					return translate( 'I want a cheaper plan.' );
				},
			},
			{
				value: 'freeIsGoodEnough',
				get label() {
					return translate( 'Free is good enough for me.' );
				},
			},
		],
	},
	{
		value: 'couldNotFinish',
		get label() {
			return translate( 'Couldn’t finish my site' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'noTime',
				get label() {
					return translate( 'I don’t have time.' );
				},
			},
			{
				value: 'needProfessionalHelp',
				get label() {
					return translate( 'Need professional help to build my site.' );
				},
			},
			{
				value: 'siteIsNotReady',
				get label() {
					return translate( 'My site is not ready.' );
				},
			},
			{
				value: 'cannotFindWhatIWanted',
				get label() {
					return translate( 'Couldn’t find what I wanted.' );
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
				value: 'otherFeatures',
				get label() {
					return translate( 'Other features' );
				},
			},
			{
				value: 'eCommerceFeatures',
				get label() {
					return translate( 'eCommerce features' );
				},
			},
			{
				value: 'customization',
				get label() {
					return translate( 'Customization / CSS' );
				},
			},
			{
				value: 'cannotUsePlugin',
				get label() {
					return translate( 'Can’t use a plugin' );
				},
			},
			{
				value: 'cannotUseTheme',
				get label() {
					return translate( 'Can’t use a theme' );
				},
			},
			{
				value: 'loadingTime',
				get label() {
					return translate( 'Loading time' );
				},
			},
		],
	},
	{
		value: 'technicalIssues',
		get label() {
			return translate( 'Technical issues' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'tooComplicated',
				get label() {
					return translate( 'It’s too complicated for me.' );
				},
			},
			{
				value: 'seoIssues',
				get label() {
					return translate( 'SEO issues' );
				},
			},
			{
				value: 'loadingTime',
				get label() {
					return translate( 'Loading time' );
				},
			},
		],
	},
	{
		value: 'domain',
		get label() {
			return translate( 'Domain' );
		},
		selectOptions: [
			PLACEHOLDER,
			{
				value: 'didNotGetFreeDomain',
				get label() {
					return translate( 'I didn’t get a free domain.' );
				},
			},
			{
				value: 'otherDomainIssues',
				get label() {
					return translate( 'Other domain issues' );
				},
			},
			{
				value: 'domainConnection',
				get label() {
					return translate( 'Problem connecting my domain' );
				},
			},
		],
	},
];

export const JETPACK_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'didNotInclude',
		get label() {
			return translate( "This upgrade didn't include what I needed." );
		},
		get textPlaceholder() {
			return translate( 'What are we missing that you need?' );
		},
	},
	{
		value: 'onlyNeedFree',
		get label() {
			return translate( 'The plan was too expensive.' );
		},
		get textPlaceholder() {
			return translate( 'How can we improve our upgrades?' );
		},
	},
	{
		value: 'couldNotActivate',
		get label() {
			return translate( 'I was unable to activate or use the product.' );
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

export const DOMAIN_REGISTRATION_CANCELLATION_REASONS: CancellationReason[] = [
	{
		value: 'misspelled',
		get label() {
			return translate( 'I misspelled the domain' );
		},
		get helpMessage() {
			return translate(
				'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
					'and you might want to consider keeping the misspelled domain.'
			);
		},
	},
	{
		value: 'other_host',
		get label() {
			return translate( 'I want to use the domain with another service or host' );
		},
		get helpMessage() {
			return translate(
				'Canceling a domain name causes the domain to become unavailable for a brief period. ' +
					'Afterward, anyone can repurchase. If you wish to use the domain with another service, ' +
					'you’ll want to {{a}}update your name servers{{/a}} instead.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( UPDATE_NAMESERVERS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		},
		isNextStepBlocked: true,
	},
	{
		value: 'transfer',
		get label() {
			return translate( 'I want to transfer my domain to another registrar' );
		},
		get helpMessage() {
			return translate(
				'Canceling a domain name may cause the domain to become unavailable for a long time before it ' +
					'can be purchased again, and someone may purchase it before you get a chance. Instead, ' +
					'please {{a}}use our transfer out feature{{/a}} if you want to use this domain again in the future.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( TRANSFER_DOMAIN_REGISTRATION ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		},
		isNextStepBlocked: true,
	},
	{
		value: 'expectations',
		get label() {
			return translate( 'The service isn’t what I expected' );
		},
		get helpMessage() {
			return translate(
				'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
					'and you might want to consider keeping the misspelled domain.'
			);
		},
	},
	{
		value: 'wanted_free',
		get label() {
			return translate( 'I meant to get a free blog' );
		},
		get textPlaceholder() {
			return translate( 'Please provide a brief description of your reasons for canceling.' );
		},
		isTextRequired: true,
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
		...DOMAIN_REGISTRATION_CANCELLATION_REASONS,
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
