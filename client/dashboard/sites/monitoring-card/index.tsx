import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	chartBar as chartBarIcon,
	download as downloadIcon,
	link as linkIcon,
} from '@wordpress/icons';
import clsx from 'clsx';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import type { ReactNode } from 'react';
import './style.scss';

interface MonitoringCardProps {
	title: string;
	description?: ReactNode;
	isLoading?: boolean;
	onDownloadClick?: () => void;
	onAnchorClick?: () => void;
	tracksId?: string;
	children?: ReactNode;
	cardLabel?: string;
	className?: string;
}

export default function MonitoringCard( {
	title,
	description,
	isLoading,
	onDownloadClick,
	onAnchorClick,
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
				<HStack justify="space-between">
					<HStack spacing={ 1 } alignment="center" expanded={ false }>
						<Text weight="bold" size="15px">
							{ title }
						</Text>
					</HStack>
					<HStack spacing={ 2 } alignment="center" expanded={ false }>
						<Button
							icon={ chartBarIcon }
							label={ sprintf(
								/* translators: %s is the card title */
								__( 'View %s chart.' ),
								title
							) }
						/>
						{ onDownloadClick && (
							<Button
								icon={ downloadIcon }
								label={ sprintf(
									/* translators: %s is the card title */
									__( 'Download %s data.' ),
									title
								) }
								onClick={ onDownloadClick }
							/>
						) }
						{ onAnchorClick && (
							<Button
								icon={ linkIcon }
								label={ sprintf(
									/* translators: %s is the card title */
									__( 'Permalink: %s.' ),
									title
								) }
								onClick={ onAnchorClick }
							/>
						) }
					</HStack>
				</HStack>
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
				<VStack spacing={ 4 }>
					{ tracksId && (
						<ComponentViewTracker
							eventName="calypso_dashboard_monitoring_card_impression"
							properties={ { feature: tracksId } }
						/>
					) }
					{ topContent }
					{ children && (
						<VStack className={ contentClassNames } spacing={ 2 } justify="center">
							{ renderContent() }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
