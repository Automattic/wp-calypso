import { Card, CardBody, ProgressBar } from '@wordpress/components';
import ComponentViewTracker from '../../components/component-view-tracker';
import OverviewCardLink from './link';
import OverviewCardSummary from './summary';
import type { OverviewCardVariant } from './types';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface OverviewCardProps {
	tracksId?: string;
	variant?: OverviewCardVariant;
	children: ReactNode;
}

interface OverviewCardWithLinkProps extends OverviewCardProps {
	link: string;
	isExternal?: boolean;
	onClick?: () => void;
}

export default function OverviewCard( { tracksId, variant, children }: OverviewCardProps ) {
	return (
		<Card
			className={
				variant
					? `dashboard-overview-card dashboard-overview-card--${ variant }`
					: 'dashboard-overview-card'
			}
			style={ {
				opacity: variant === 'disabled' ? 0.5 : 1,
			} }
		>
			<CardBody>
				{ tracksId &&
					( variant === 'upsell' ? (
						<ComponentViewTracker
							eventName="calypso_dashboard_upsell_impression"
							properties={ { feature: tracksId, type: 'card' } }
						/>
					) : (
						<ComponentViewTracker
							eventName="calypso_dashboard_overview_card_impression"
							properties={ { feature: tracksId, variant } }
						/>
					) ) }
				{ children }
			</CardBody>
		</Card>
	);
}

export function OverviewCardWithLink( {
	tracksId,
	variant,
	link,
	isExternal,
	onClick,
	children,
}: OverviewCardWithLinkProps ) {
	return (
		<OverviewCardLink link={ link } isExternal={ isExternal } onClick={ onClick }>
			<OverviewCard tracksId={ tracksId } variant={ variant }>
				{ children }
			</OverviewCard>
		</OverviewCardLink>
	);
}

export function OverviewCardWithPlaceholder( {
	title,
	icon,
}: {
	title: string;
	icon?: ReactElement;
} ) {
	return (
		<OverviewCard variant="loading">
			<OverviewCardSummary
				title={ title }
				icon={ icon }
				customHeading={ <OverviewCardProgressBar /> }
			/>
		</OverviewCard>
	);
}

export function OverviewCardProgressBar( { value }: { value?: number } ) {
	return <ProgressBar className="dashboard-overview-card__progress-bar" value={ value } />;
}
