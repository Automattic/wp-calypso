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
	showStartingAt?: boolean;
	originalPrice: number;
	productName: TranslateResult;
	tooltipText?: TranslateResult | ReactNode;
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
	showStartingAt,
	hideSavingLabel,
	originalPrice,
	productName,
	tooltipText,
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
				showStartingAt={ showStartingAt }
				belowPriceText={ belowPriceText }
			/>
		);
	}

	return (
		<Paid
			discountedPrice={ discountedPrice }
			originalPrice={ originalPrice }
			billingTerm={ billingTerm }
			currencyCode={ currencyCode }
			displayFrom={ displayFrom }
			tooltipText={ tooltipText }
			expiryDate={ expiryDate }
			hideSavingLabel={ hideSavingLabel }
		/>
	);
};

const Wrapper: React.FC< OwnProps > = ( props ) => (
	<div className="display-price">
		<DisplayPrice { ...props } />
	</div>
);

export default Wrapper;
