import { useTranslate } from 'i18n-calypso';
import { usePlanUpsellInfo } from '../hooks/use-plan-upsell-info';
import PlanUpsellButton from './plan-upsell-button';
import type { PlanSlug } from '@automattic/calypso-products';
import type { ReactNode } from 'react';

interface Props {
	planSlug: PlanSlug;
	description: ReactNode;
	isBusy: boolean;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
}

const PlanInfoContainer = styled.div`
	font-size: 16px;
	line-height: 20px;
	color: var( --studio-gray-80 );
	overflow-wrap: break-word;
	max-width: 100%;
	@media ( min-width: 780px ) {
		max-width: 54%;
	}
`;

const PlanPrice = styled.span`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-gray-50 );
`;

export const PlanName = styled.span`
	font-size: 16px;
	font-style: normal;
	font-weight: 500;
	line-height: 24px;
	letter-spacing: -0.32px;
	color: var( --studio-gray-90 );
`;

export const PlanDescription = styled.div`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-gray-50 );
	margin-top: 4px;
`;

const PlanInfo = ( { planSlug, description, isBusy, onPlanSelected }: Props ) => {
	const translate = useTranslate();
	const planUpsellInfo = usePlanUpsellInfo( { planSlug } );

	return (
		<>
			<PlanInfoContainer>
				<div>
					<PlanName>{ paidDomainName }</PlanName>
					<PlanPrice>
						{ translate( '%(planPrice)s/month', {
							comment: 'Eg: $4/month',
							args: {
								planPrice: planUpsellInfo.formattedPriceMonthly,
							},
						} ) }
					</PlanPrice>
				</div>
				<PlanDescription>{ description }</PlanDescription>
			</PlanInfoContainer>
			<PlanUpsellButton planSlug={ planSlug } isBusy={ isBusy } onPlanSelected={ onPlanSelected } />
		</>
	);
};

export default PlanInfo;
