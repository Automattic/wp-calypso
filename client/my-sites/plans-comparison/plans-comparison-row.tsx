import styled from '@emotion/styled';
import { intersection } from 'lodash';
import { SCREEN_BREAKPOINT } from './constant';
import { PlansComparisonRowHeader } from './plans-comparison-row-header';
import type { PlanComparisonFeature } from './plans-comparison-features';
import type { WPComPlan } from '@automattic/calypso-products';

interface Props {
	feature: PlanComparisonFeature;
	plans: WPComPlan[];
}

const DesktopContent = styled.div`
	display: flex;
	flex-direction: column;

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT }px ) {
		display: none;
	}
`;

const MobileContent = styled.div`
	display: none;

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT }px ) {
		display: flex;
		flex-direction: column;
	}
`;

const Description = styled.p`
	font-size: 0.75rem;
	color: var( --studio-gray-30 );
`;

function renderContent( content: ReturnType< PlanComparisonFeature[ 'getCellText' ] > ) {
	const contentArray = Array.isArray( content ) ? content : [ content ];

	return (
		<>
			<span>{ contentArray[ 0 ] }</span>
			{ contentArray[ 1 ] && <Description>{ contentArray[ 1 ] }</Description> }
		</>
	);
}

export const PlansComparisonRow: React.FunctionComponent< Props > = ( { feature, plans } ) => {
	return (
		<tr>
			<PlansComparisonRowHeader
				scope="row"
				title={ feature.title }
				subtitle={ feature.subtitle }
				description={ feature.description }
			/>
			{ plans.map( ( plan ) => {
				const includedFeature = intersection(
					plan.getPlanCompareFeatures?.() || [],
					feature.features
				)[ 0 ];

				return (
					<td>
						<DesktopContent>
							{ renderContent( feature.getCellText( includedFeature, false ) ) }
						</DesktopContent>
						<MobileContent>
							{ renderContent( feature.getCellText( includedFeature, true ) ) }
						</MobileContent>
					</td>
				);
			} ) }
		</tr>
	);
};
