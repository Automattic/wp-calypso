import {
	getPlan,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_MANAGED,
	TYPE_MANAGED,
} from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { SCREEN_BREAKPOINT } from './constant';
import { PlansComparisonAction } from './plans-comparison-action';
import { PlansComparisonColHeader } from './plans-comparison-col-header';
import { planComparisonFeatures } from './plans-comparison-features';
import { PlansComparisonRow } from './plans-comparison-row';
import type { WPComPlan } from '@automattic/calypso-products';

interface TableProps {
	firstColWidth: number;
	planCount: number;
}

const ComparisonTable = styled.table< TableProps >`
	max-width: 100%;
	border-collapse: collapse;
	margin: 0 auto;

	th,
	td {
		background: var( --studio-white );
		border-bottom: 1px solid var( --studio-gray-0 );
		padding: 1rem;
		min-height: 2rem;
		width: ${ ( { firstColWidth, planCount } ) => `${ ( 100 - firstColWidth ) / planCount }%` };
		vertical-align: top;
	}

	th:nth-child( odd ),
	td:nth-child( odd ) {
		background: var( --studio-blue-0 );
	}

	th:first-child,
	td:first-child {
		background: var( --studio-white );
		width: ${ ( { firstColWidth } ) => `${ firstColWidth }%` };
	}

	.button {
		width: 100%;
		border-radius: 4px;
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT }px ) {
		th:first-child,
		td:first-child {
			display: none;
		}

		th,
		td {
			width: ${ ( { planCount } ) => `${ 100 / planCount }%` };
		}
	}
`;

const THead = styled.thead`
	position: sticky;
	top: 0;
`;

interface Props {
	isInSignup?: boolean;
	selectedSiteId?: number;
}

export const PlansComparison: React.FunctionComponent< Props > = ( {
	isInSignup = false,
	selectedSiteId,
} ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSiteId || null ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? '';
	const plans = [ getPlan( PLAN_WPCOM_FLEXIBLE ), getPlan( PLAN_WPCOM_MANAGED ) ] as WPComPlan[];

	return (
		<ComparisonTable firstColWidth={ 30 } planCount={ plans.length }>
			<THead>
				<tr>
					<th>
						<br />
					</th>
					{ plans.map( ( plan ) => (
						<PlansComparisonColHeader plan={ plan } currencyCode={ currencyCode } price={ 0 }>
							<PlansComparisonAction
								currentSitePlanSlug={ sitePlan?.product_slug }
								planName={ String( plan.getTitle() ) }
								planType={ plan.type }
								isInSignup={ isInSignup }
								isPrimary={ plan.type === TYPE_MANAGED }
							/>
						</PlansComparisonColHeader>
					) ) }
				</tr>
			</THead>
			<tbody>
				{ planComparisonFeatures.map( ( feature ) => (
					<PlansComparisonRow feature={ feature } plans={ plans } key={ feature.features[ 0 ] } />
				) ) }
			</tbody>
		</ComparisonTable>
	);
};
