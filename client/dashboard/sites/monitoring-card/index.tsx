import CircularProgressBar from '@automattic/components/src/circular-progress-bar';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { TextSkeleton } from '../../components/text-skeleton';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import './style.scss';

export interface MonitoringCardProps {
	icon?: ReactElement;
	title: string;
	heading?: ReactNode;
	description?: ReactNode;
	progress?: {
		value: number;
		max: number;
		label: string;
		variant?: ComponentProps< typeof CircularProgressBar >[ 'variant' ];
	};
	intent?: 'upsell' | 'success' | 'warning' | 'error';
	disabled?: boolean;
	isLoading?: boolean;
	link?: string;
	externalLink?: string;
	tracksId?: string;
	bottom?: ReactNode;
}

export default function MonitoringCard( {
	icon,
	title,
	description,
	progress,
	intent,
	disabled,
	isLoading,
	link,
	externalLink,
	tracksId,
	bottom,
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
			<VStack spacing={ 4 } style={ { flexGrow: 1 } }>
				<HStack justify="space-between">
					<HStack
						spacing={ 2 }
						alignment="center"
						expanded={ false }
						className="dashboard-monitoring-card__title-container"
					>
						{ icon && <Icon className="dashboard-monitoring-card__icon" icon={ icon } /> }
						<Text className="dashboard-monitoring-card__title">{ title }</Text>
					</HStack>
					{ link && ! progress && (
						<Icon className="dashboard-monitoring-card__link-icon" icon={ chevronRight } />
					) }
					{ externalLink && ! progress && (
						<span
							className="dashboard-monitoring-card__link-icon components-external-link__icon"
							aria-label={
								/* translators: accessibility text */
								__( '(opens in a new tab)' )
							}
						>
							&#8599;
						</span>
					) }
				</HStack>
				<HStack justify="flex-start" alignment="baseline">
					<Text
						className="dashboard-monitoring-card__description"
						intent={ intent === 'warning' || intent === 'error' ? intent : undefined }
						variant={ intent === 'warning' || intent === 'error' ? undefined : 'muted' }
					>
						{ renderDescription() }
					</Text>
				</HStack>
			</VStack>
			{ progress && (
				<CircularProgressBar
					currentStep={ progress.value }
					numberOfSteps={ progress.max }
					size={ 80 }
					strokeColor="var(--wp-admin-theme-color)"
					strokeWidth={ 1.5 }
					variant={ progress.variant }
					customText={
						<Text lineHeight="20px" size={ 15 } weight={ 500 }>
							{ progress.label }
						</Text>
					}
				/>
			) }
		</HStack>
	);

	return (
		<Card
			className={ clsx( 'dashboard-monitoring-card', {
				[ `dashboard-monitoring-card--${ intent }` ]: intent,
				'dashboard-monitoring-card--disabled': isLoading || disabled,
			} ) }
		>
			<CardBody>
				{ tracksId &&
					( intent === 'upsell' ? (
						<ComponentViewTracker
							eventName="calypso_dashboard_upsell_impression"
							properties={ { feature: tracksId, type: 'card' } }
						/>
					) : (
						<ComponentViewTracker
							eventName="calypso_dashboard_monitoring_card_impression"
							properties={ { feature: tracksId, intent } }
						/>
					) ) }
				{ topContent }
				{ bottom && (
					<>
						<VStack
							className="dashboard-monitoring-card__content"
							spacing={ 2 }
							justify="flex-start"
							style={ { flexGrow: 1 } }
						>
							{ bottom }
						</VStack>
					</>
				) }
			</CardBody>
		</Card>
	);
}
