import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Spinner,
} from '@wordpress/components';
import clsx from 'clsx';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
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
	const renderDescription = () => {
		if ( description ) {
			return description;
		}
		return <>&nbsp;</>;
	};

	const renderContent = () => {
		if ( isLoading ) {
			return <Spinner />;
		}

		return children;
	};

	const topContent = (
		<HStack justify="space-between" alignment="flex-start">
			<VStack spacing={ 4 } className="dashboard-monitoring-card__header">
				<Text weight="bold" size="15px">
					{ title }
				</Text>
				<HStack justify="flex-start" alignment="baseline">
					<Text variant="muted">{ renderDescription() }</Text>
				</HStack>
			</VStack>
		</HStack>
	);

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
					{ topContent }
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
