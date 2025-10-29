import { __experimentalVStack as VStack, Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import { SectionHeader } from '../../components/section-header';
import type { ReactNode } from 'react';
import './style.scss';

interface MonitoringCardProps {
	title: string;
	description?: ReactNode;
	isLoading?: boolean;
	tracksId?: string;
	children?: ReactNode;
	cardLabel?: string;
	className?: string;
}

export default function MonitoringCard( {
	title,
	description,
	isLoading,
	tracksId,
	children,
	cardLabel,
	className,
}: MonitoringCardProps ) {
	const renderContent = () => {
		if ( isLoading ) {
			return <Spinner />;
		}

		return children;
	};

	const contentClassNames = clsx(
		'dashboard-monitoring-card__content',
		isLoading && 'dashboard-monitoring-card__content__is-loading',
		cardLabel && `dashboard-monitoring-card__content__${ cardLabel }`
	);

	return (
		<Card className={ clsx( 'dashboard-monitoring-card', className ) }>
			<CardBody>
				<VStack spacing={ 4 } className="dashboard-monitoring-card__body" justify="flex-start">
					{ tracksId && (
						<ComponentViewTracker
							eventName="calypso_dashboard_monitoring_card_impression"
							properties={ { feature: tracksId } }
						/>
					) }
					<SectionHeader level={ 3 } title={ title } description={ description } />
					{ children && (
						<VStack className={ contentClassNames } spacing={ 2 } justify="space-between">
							{ renderContent() }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
