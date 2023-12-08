import { UrlFriendlyTermType } from '@automattic/calypso-products';
import { LocalizeProps, TranslateResult, useTranslate } from 'i18n-calypso';
import { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../types';
import generatePath from '../utils';
import useTermViseMaxDiscounts from './use-term-vise-max-dicounts';

const getDiscountText = ( discountPercentage: number, translate: LocalizeProps[ 'translate' ] ) => {
	if ( ! discountPercentage ) {
		return '';
	}
	return translate( 'upto %(discount)d% off', {
		args: { discount: discountPercentage },
		comment: 'Discount percentage',
	} );
};
export default function useIntervalOptions( props: IntervalTypeProps ): Record<
	SupportedUrlFriendlyTermType,
	{
		key: string;
		name: TranslateResult;
		discountText: TranslateResult;
		url: string;
		termInMonths: number;
		ui?: any;
	}
> {
	const translate = useTranslate();
	const optionList: Record<
		SupportedUrlFriendlyTermType,
		{
			key: string;
			name: TranslateResult;
			discountText: TranslateResult;
			url: string;
			termInMonths: number;
		}
	> = {
		yearly: {
			key: 'yearly',
			name: translate( 'Pay yearly' ),
			discountText: '',
			url: '',
			termInMonths: 12,
		},
		'2yearly': {
			key: '2yearly',
			name: translate( 'Pay every 2 years' ),
			discountText: '',
			url: '',
			termInMonths: 24,
		},
		'3yearly': {
			key: '3yearly',
			name: translate( 'Pay every 3 years' ),
			discountText: '',
			url: '',
			termInMonths: 36,
		},
		monthly: {
			key: 'monthly',
			name: translate( 'Pay monthly' ),
			discountText: '',
			url: '',
			termInMonths: 1,
		},
	};
	const termViseDiscounts = useTermViseMaxDiscounts(
		props.plans,
		Object.keys( optionList ) as Array< UrlFriendlyTermType >,
		props.usePricingMetaForGridPlans
	);

	const additionalPathProps = {
		...( props.redirectTo ? { redirect_to: props.redirectTo } : {} ),
		...( props.selectedPlan ? { plan: props.selectedPlan } : {} ),
		...( props.selectedFeature ? { feature: props.selectedFeature } : {} ),
	};

	const isDomainUpsellFlow = new URLSearchParams( window.location.search ).get( 'domain' );

	const isDomainAndPlanPackageFlow = new URLSearchParams( window.location.search ).get(
		'domainAndPlanPackage'
	);

	const isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );

	Object.keys( optionList ).forEach( ( key ) => {
		optionList[ key as SupportedUrlFriendlyTermType ] = {
			...optionList[ key as SupportedUrlFriendlyTermType ],
			url: generatePath( props, {
				intervalType: key,
				domain: isDomainUpsellFlow,
				domainAndPlanPackage: isDomainAndPlanPackageFlow,
				jetpackAppPlans: isJetpackAppFlow,
				...additionalPathProps,
			} ),
			discountText: getDiscountText( termViseDiscounts[ key as UrlFriendlyTermType ], translate ),
		};
	} );

	return optionList;
}

// if ( termViseMaxDiscount[ key ] ) {
// 	option.discountText = translate( 'Save %(discount)s', {
// 		args: { discount: termViseMaxDiscount[ key ] },
// 		comment: 'Discount percentage',
// 	} );
// }
