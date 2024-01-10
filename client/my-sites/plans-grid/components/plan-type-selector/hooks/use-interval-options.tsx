import { LocalizeProps, TranslateResult, useTranslate } from 'i18n-calypso';
import { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../types';
import generatePath from '../utils';
import useMaxDiscountsForPlanTerms from './use-max-discounts-for-plan-terms';

const getDiscountText = ( discountPercentage: number, translate: LocalizeProps[ 'translate' ] ) => {
	if ( ! discountPercentage ) {
		return '';
	}
	return translate( 'up to %(discount)d% off', {
		args: { discount: discountPercentage },
		comment: 'Discount percentage',
	} );
};

type IntervalSelectOptionsMap = Record<
	SupportedUrlFriendlyTermType,
	{
		key: string;
		name: TranslateResult;
		discountText: TranslateResult;
		url: string;
		termInMonths: number;
	}
>;
export default function useIntervalOptions( props: IntervalTypeProps ): IntervalSelectOptionsMap {
	const translate = useTranslate();
	let optionList: Record<
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
	const termWiseMaxDiscount = useMaxDiscountsForPlanTerms(
		props.plans,
		Object.keys( optionList ) as Array< SupportedUrlFriendlyTermType >,
		props.usePricingMetaForGridPlans,
		props.selectedSiteId
	);

	const additionalPathProps = {
		...( props.redirectTo ? { redirect_to: props.redirectTo } : {} ),
	};

	let isDomainUpsellFlow: string | null = '';
	let isDomainAndPlanPackageFlow: string | null = '';
	let isJetpackAppFlow: string | null = '';
	if ( typeof window !== 'undefined' ) {
		isDomainUpsellFlow = new URLSearchParams( window.location.search ).get( 'domain' );
		isDomainAndPlanPackageFlow = new URLSearchParams( window.location.search ).get(
			'domainAndPlanPackage'
		);
		isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );
	}

	optionList = Object.fromEntries(
		Object.keys( optionList ).map( ( key ) => [
			key,
			{
				...optionList[ key as SupportedUrlFriendlyTermType ],
				url: generatePath( props, {
					intervalType: key,
					domain: isDomainUpsellFlow,
					domainAndPlanPackage: isDomainAndPlanPackageFlow,
					jetpackAppPlans: isJetpackAppFlow,
					...additionalPathProps,
				} ),
				discountText: getDiscountText(
					termWiseMaxDiscount[ key as SupportedUrlFriendlyTermType ],
					translate
				),
			},
		] )
	) as IntervalSelectOptionsMap;

	return optionList;
}
