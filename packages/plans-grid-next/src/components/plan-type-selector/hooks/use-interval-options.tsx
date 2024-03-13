import { type LocalizeProps, type TranslateResult, useTranslate } from 'i18n-calypso';
import useMaxDiscountsForPlanTerms from './use-max-discounts-for-plan-terms';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

const getDiscountText = ( discountPercentage: number, translate: LocalizeProps[ 'translate' ] ) => {
	if ( ! discountPercentage ) {
		return '';
	}
	return translate( 'up to %(discount)d%% off', {
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
		termInMonths: number;
	}
>;
export default function useIntervalOptions( props: IntervalTypeProps ): IntervalSelectOptionsMap {
	const translate = useTranslate();
	const { displayedIntervals } = props;
	const optionList: Record<
		SupportedUrlFriendlyTermType,
		{
			key: SupportedUrlFriendlyTermType;
			name: TranslateResult;
			discountText: TranslateResult;
			termInMonths: number;
		}
	> = {
		yearly: {
			key: 'yearly',
			name: translate( 'Pay yearly' ),
			discountText: '',
			termInMonths: 12,
		},
		'2yearly': {
			key: '2yearly',
			name: translate( 'Pay every 2 years' ),
			discountText: '',
			termInMonths: 24,
		},
		'3yearly': {
			key: '3yearly',
			name: translate( 'Pay every 3 years' ),
			discountText: '',
			termInMonths: 36,
		},
		monthly: {
			key: 'monthly',
			name: translate( 'Pay monthly' ),
			discountText: '',
			termInMonths: 1,
		},
	};

	let displayedOptionList = Object.fromEntries(
		Object.entries( optionList ).filter( ( [ , value ] ) =>
			displayedIntervals.includes( value.key )
		)
	) as IntervalSelectOptionsMap;

	const termWiseMaxDiscount = useMaxDiscountsForPlanTerms(
		props.plans,
		Object.keys( displayedOptionList ) as Array< SupportedUrlFriendlyTermType >,
		props.useCheckPlanAvailabilityForPurchase,
		props.siteId
	);

	displayedOptionList = Object.fromEntries(
		Object.keys( displayedOptionList ).map( ( key ) => [
			key as SupportedUrlFriendlyTermType,
			{
				...displayedOptionList[ key as SupportedUrlFriendlyTermType ],
				discountText: getDiscountText(
					termWiseMaxDiscount[ key as SupportedUrlFriendlyTermType ],
					translate
				),
			},
		] )
	) as IntervalSelectOptionsMap;

	return displayedOptionList;
}
