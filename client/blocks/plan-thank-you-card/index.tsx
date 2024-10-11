import { getPlanClass } from '@automattic/calypso-products';
import { ProductIcon } from '@automattic/components';
import { Site, Plans } from '@automattic/data-stores';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import ThankYouCard from 'calypso/components/thank-you-card';
import type { SupportedSlugs } from '@automattic/components';

import './style.scss';

interface Props {
	action?: React.ReactNode;
	buttonText?: string;
	buttonUrl?: string;
	description?: string | React.ReactNode;
	heading?: string;
	siteId?: number | string | null;
}

const PlanThankYouCard = ( {
	siteId,
	action,
	buttonText,
	buttonUrl,
	description,
	heading,
}: Props ) => {
	const translate = useTranslate();
	const { data: site } = Site.useSite( { siteIdOrSlug: siteId } );
	const { data: plans } = Plans.usePlans( { coupon: undefined } );
	const currentPlan = Plans.useCurrentPlan( { siteId } );

	/**
	 * We could skip rendering and simplify the code checking on site, plans, and currentPlan:
	 *
	 *   if ( ! site || ! plans || ! currentPlan ) {
	 *       return null;
	 *   }
	 */

	const classes = clsx(
		'plan-thank-you-card',
		currentPlan && getPlanClass( currentPlan.planSlug )
	);

	const icon = currentPlan ? (
		<ProductIcon
			slug={ currentPlan.planSlug as SupportedSlugs /* we should never need to do this */ }
		/>
	) : null;

	const name =
		currentPlan && plans?.[ currentPlan.planSlug ]?.productNameShort
			? translate( '%(planName)s Plan', {
					args: { planName: plans[ currentPlan.planSlug ].productNameShort },
			  } )
			: '';

	return (
		<div className={ classes }>
			<ThankYouCard
				name={ name }
				heading={ heading ?? translate( 'Thank you for your purchase!' ) }
				description={
					description ??
					translate( "Now that we've taken care of the plan, it's time to see your new site." )
				}
				descriptionWithHTML={ 'object' === typeof description ? description : null }
				buttonUrl={ buttonUrl ?? site?.URL }
				buttonText={ buttonText ?? translate( 'Visit Your Site' ) }
				icon={ icon }
				action={ action ?? null }
			/>
		</div>
	);
};

export default localize( PlanThankYouCard );
