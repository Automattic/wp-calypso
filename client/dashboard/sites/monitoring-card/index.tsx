import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	chartBar as chartBarIcon,
	download as downloadIcon,
	link as linkIcon,
} from '@wordpress/icons';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { TextSkeleton } from '../../components/text-skeleton';
import type { ReactNode } from 'react';
import './style.scss';

export interface MonitoringCardProps {
	title: string;
	description?: ReactNode;
	isLoading?: boolean;
	onDownloadClick?: () => void;
	onAnchorClick?: () => void;
	tracksId?: string;
	children?: ReactNode;
}

export default function MonitoringCard( {
	title,
	description,
	isLoading,
	onDownloadClick,
	onAnchorClick,
	tracksId,
	children,
}: MonitoringCardProps ) {
	const renderDescription = () => {
		if ( isLoading ) {
			return <TextSkeleton length={ 20 } />;
		}
		if ( description ) {
			return description;
		}
		return <>&nbsp;</>;
	};

	const topContent = (
		<HStack
			className="dashboard-monitoring-card__content"
			justify="space-between"
			alignment="flex-start"
		>
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

	return (
		<Card className="dashboard-monitoring-card">
			<CardBody>
				{ tracksId && (
					<ComponentViewTracker
						eventName="calypso_dashboard_monitoring_card_impression"
						properties={ { feature: tracksId } }
					/>
				) }
				{ topContent }
				{ ! isLoading && children && (
					<VStack className="dashboard-monitoring-card__content" spacing={ 2 } justify="flex-start">
						{ children }
					</VStack>
				) }
			</CardBody>
		</Card>
	);
}
