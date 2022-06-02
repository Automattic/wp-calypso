import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { intersection } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { mobile_breakpoint } from './breakpoints';
import type { PlanComparisonFeature } from './plans-comparison-features';
import type { WPComPlan } from '@automattic/calypso-products';

interface Props {
	plan: WPComPlan;
	features: PlanComparisonFeature[];
	showCollapsibleRows: boolean;
	isLegacySiteWithHigherLimits: boolean;
}
const PlansComparisonRows = styled.div`
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	padding: 0 22px 22px;
	margin-bottom: 22px;

	.plans-comparison__collapsible {
		display: none;
	}

	&.show-collapsible .plans-comparison__collapsible {
		display: inherit;
		animation: fade-in-rows 0.3s ease;

		@keyframes fade-in-rows {
			0% {
				opacity: 0;
			}

			100% {
				opacity: 1;
			}
		}
	}

	&.pro-plan {
		background: #f0f7fc;
		border: none;
	}
	&.starter-plan {
		border: solid 1px #e9e9ea;
		border-top: none;
		background: #fff;
	}

	${ mobile_breakpoint( `
		&.pro-plan {
			grid-row: 2;
		}
		&.starter-plan {
			grid-row: 4;
    	}
	` ) }

	.button {
		margin-top: 22px;
	}
`;
const Title = styled.div`
	gap: 0.4rem;
	display: flex;

	.gridicon.gridicon {
		width: 1.1em;
		height: 1.1em;
		margin-top: 2px;
	}

	.gridicons-checkmark {
		fill: var( --studio-green-50 );
	}

	.gridicons-cross {
		fill: #d63638;
	}
`;

const Feature = styled.div`
	font-size: 16px;
	line-height: 1.4;
	display: flex;
	align-items: flex-start;
	padding: 8px 0;
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

const PlansComparisonToggle = styled.div`
	margin-top: 22px;
	display: none;

	button {
		background: none;
		display: flex;
		justify-content: space-between;
		padding: 15px 0;
		width: 100%;
		cursor: pointer;
		border-top: solid 1px #e9e9ea;
	}

	${ mobile_breakpoint( `display: block` ) }
`;

export const PlansComparisonCol: React.FunctionComponent< Props > = ( {
	plan,
	features,
	showCollapsibleRows,
	isLegacySiteWithHigherLimits,
	children,
} ) => {
	const translate = useTranslate();
	const [ showAllRows, setShowAllRows ] = useState( showCollapsibleRows );
	useEffect( () => {
		setShowAllRows( showCollapsibleRows );
	}, [ showCollapsibleRows ] );

	const showAllRowsToggle = useCallback( () => {
		setShowAllRows( ! showAllRows );
	}, [ showAllRows ] );

	const classes = classNames( plan.getStoreSlug(), { 'show-collapsible': showAllRows } );

	return (
		<PlansComparisonRows className={ classes }>
			{ features.map( ( feature, index ) => {
				const includedFeature = intersection(
					plan.getPlanCompareFeatures?.() || [],
					feature.features
				)[ 0 ];

				return (
					<Feature key={ index } className={ index > 8 ? 'plans-comparison__collapsible' : '' }>
						{ renderContent(
							feature.getCellText(
								includedFeature,
								feature.title,
								false,
								isLegacySiteWithHigherLimits
							)
						) }
					</Feature>
				);
			} ) }
			{ children }
			<PlansComparisonToggle>
				<button onClick={ showAllRowsToggle }>
					{ showAllRows ? (
						<>
							{ translate( 'Hide all features' ) }
							<Gridicon size={ 12 } icon="chevron-up" />
						</>
					) : (
						<>
							{ translate( 'Show all features' ) }
							<Gridicon size={ 12 } icon="chevron-down" />
						</>
					) }
				</button>
			</PlansComparisonToggle>
		</PlansComparisonRows>
	);
};
