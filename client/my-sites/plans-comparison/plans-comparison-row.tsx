import styled from '@emotion/styled';
import { intersection } from 'lodash';
import { PlansComparisonRowHeader } from './plans-comparison-row-header';
import type { PlanComparisonFeature } from './plans-comparison-features';
import type { WPComPlan } from '@automattic/calypso-products';

interface Props {
	feature: PlanComparisonFeature;
	plans: WPComPlan[];
}

export const DesktopContent = styled.div`
	display: flex;
	flex-direction: column;
`;

export const MobileContent = styled.div`
	display: none;
	font-weight: 400;
`;

const Title = styled.div`
	gap: 0.5rem;

	.gridicon.gridicon {
		width: 1.1em;
		height: 1.1em;

		html[dir='ltr'] & {
			margin: 0 5px -2px 0;
		}
		html[dir='rtl'] & {
			margin: 0 0 -2px 5px;
		}
	}

	.gridicons-checkmark {
		fill: var( --studio-green-50 );
	}

	.gridicons-cross {
		fill: #d63638;
	}
`;

const Description = styled.p`
	font-size: 0.75rem;
	color: var( --studio-gray-40 );
	margin: 0;
	font-weight: 400;
`;

function renderContent( content: ReturnType< PlanComparisonFeature[ 'getCellText' ] > ) {
	const contentArray = Array.isArray( content ) ? content : [ content ];

	return (
		<>
			<Title>{ contentArray[ 0 ] }</Title>
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
					<td key={ plan.getProductId() }>
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
