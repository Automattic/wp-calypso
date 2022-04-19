import classNames from 'classnames';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import Deprecated from './deprecated';
import Free from './free';
import IncludedInPlan from './included-in-plan';
import Owned from './owned';
import Paid from './paid';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { TranslateResult } from 'i18n-calypso';
import type { Moment } from 'moment';
import type { ReactNode } from 'react';

import './style.scss';

type OwnProps = {
	belowPriceText?: TranslateResult;
	billingTerm: Duration;
	currencyCode?: string | null;
	discountedPrice?: number;
	displayFrom?: boolean;
	expiryDate?: Moment;
	hideSavingLabel?: boolean;
	isDeprecated?: boolean;
	isFree?: boolean;
	isIncludedInPlan?: boolean;
	isOwned?: boolean;
	pricesAreFetching?: boolean | null;
	showAbovePriceText?: boolean;
	originalPrice?: number;
	productName: TranslateResult;
	tooltipText?: TranslateResult | ReactNode;
	isPricingPageTreatment202204?: boolean;
	isPricingPageTest202204AssignmentLoading?: boolean;
};

const DisplayPrice: React.FC< OwnProps > = ( {
	belowPriceText,
	billingTerm,
	currencyCode,
	discountedPrice,
	displayFrom,
	expiryDate,
	isDeprecated,
	isFree,
	isIncludedInPlan,
	isOwned,
	showAbovePriceText,
	hideSavingLabel,
	originalPrice,
	pricesAreFetching,
	productName,
	tooltipText,
	isPricingPageTreatment202204,
	isPricingPageTest202204AssignmentLoading,
} ) => {
	if ( isDeprecated ) {
		return <Deprecated productName={ productName } />;
	}

	if ( isOwned ) {
		return <Owned />;
	}

	if ( isIncludedInPlan ) {
		return <IncludedInPlan />;
	}

	if ( isFree ) {
		return (
			<Free
				showAbovePriceText={ showAbovePriceText }
				hideSavingLabel={ hideSavingLabel }
				belowPriceText={ belowPriceText }
			/>
		);
	}

	return (
		<Paid
			discountedPrice={ discountedPrice }
			originalPrice={ originalPrice }
			pricesAreFetching={ pricesAreFetching }
			billingTerm={ billingTerm }
			currencyCode={ currencyCode }
			displayFrom={ displayFrom }
			tooltipText={ tooltipText }
			expiryDate={ expiryDate }
			isPricingPageTreatment202204={ isPricingPageTreatment202204 }
			isPricingPageTest202204AssignmentLoading={ isPricingPageTest202204AssignmentLoading }
		/>
	);
};

const Wrapper: React.FC< OwnProps > = ( props ) => {
	const priceTypes = {
		'is-deprecated': Boolean( props.isDeprecated ),
		'is-owned': Boolean( props.isOwned ),
		'is-included-in-plan': Boolean( props.isIncludedInPlan ),
		'is-free': Boolean( props.isFree ),
		'is-placeholder': Boolean( props.pricesAreFetching ),
	};

	return (
		<div
			className={ classNames(
				'display-price',
				{ 'is-jetpack-cloud': isJetpackCloud() },
				priceTypes
			) }
		>
			<DisplayPrice { ...props } />
		</div>
	);
};

export default Wrapper;
