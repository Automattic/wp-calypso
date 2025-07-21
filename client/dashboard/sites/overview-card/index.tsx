import CircularProgressBar from '@automattic/components/src/circular-progress-bar';
import { Link } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import { TextSkeleton } from '../../components/text-skeleton';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import './style.scss';

export interface OverviewCardProps {
	icon?: ReactElement;
	title: string;
	heading?: ReactNode;
	description?: string;
	progress?: {
		value: number;
		max: number;
		label: string;
		variant?: ComponentProps< typeof CircularProgressBar >[ 'variant' ];
	};
	intent?: 'upsell' | 'success' | 'error';
	disabled?: boolean;
	isLoading?: boolean;
	link?: string;
	externalLink?: string;
	tracksId?: string;
	bottom?: ReactNode;
	onClick?: () => void;
}

export default function OverviewCard( {
	icon,
	title,
	heading,
	description,
	progress,
	intent,
	disabled,
	isLoading,
	link,
	externalLink,
	tracksId,
	bottom,
	onClick,
}: OverviewCardProps ) {
	const { recordTracksEvent } = useAnalytics();

	const renderHeading = () => {
		if ( isLoading ) {
			return <TextSkeleton length={ 10 } />;
		}
		if ( heading ) {
			return heading;
		}
		return <>&nbsp;</>;
	};

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
		<HStack justify="space-between" className="dashboard-overview-card__content">
			<VStack spacing={ 4 } style={ { flexGrow: 1 } }>
				<HStack justify="space-between">
					<HStack spacing={ 2 } alignment="center" expanded={ false }>
						{ icon && <Icon className="dashboard-overview-card__icon" icon={ icon } /> }
						<Text
							className="dashboard-overview-card__title"
							variant="muted"
							lineHeight="16px"
							size={ 11 }
							weight={ 500 }
							upperCase
						>
							{ title }
						</Text>
					</HStack>
					{ link && ! progress && (
						<Icon className="dashboard-overview-card__link-icon" icon={ chevronRight } />
					) }
					{ externalLink && ! progress && (
						<span
							className="dashboard-overview-card__link-icon components-external-link__icon"
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
					<VStack spacing={ 2 }>
						<Heading
							level={ 2 }
							size={ 20 }
							variant={ disabled ? 'muted' : undefined }
							weight={ 500 }
						>
							{ renderHeading() }
						</Heading>
						<Text
							className="dashboard-overview-card__description"
							variant="muted"
							lineHeight="16px"
							size={ 12 }
						>
							{ renderDescription() }
						</Text>
					</VStack>
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

	const handleClick = () => {
		onClick?.();

		if ( tracksId ) {
			if ( intent === 'upsell' ) {
				recordTracksEvent( 'calypso_dashboard_upsell_click', {
					feature: tracksId,
					type: 'card',
				} );
			} else {
				recordTracksEvent( 'calypso_dashboard_overview_card_click', {
					type: tracksId,
					intent,
				} );
			}
		}
	};

	const renderContent = () => {
		if ( link ) {
			return (
				<Link to={ link } className="dashboard-overview-card__link" onClick={ handleClick }>
					{ topContent }
				</Link>
			);
		}

		if ( externalLink ) {
			return (
				<a
					href={ externalLink }
					className="dashboard-overview-card__link"
					target="_blank"
					rel="noreferrer"
					onClick={ handleClick }
				>
					{ topContent }
				</a>
			);
		}

		if ( onClick ) {
			return (
				<Button
					className="dashboard-overview-card__link dashboard-overview-card__button"
					onClick={ handleClick }
				>
					{ topContent }
				</Button>
			);
		}

		return topContent;
	};

	return (
		<Card
			className={ clsx( 'dashboard-overview-card', {
				[ `dashboard-overview-card--${ intent }` ]: intent,
				'dashboard-overview-card--disabled': isLoading || disabled,
				'dashboard-overview-card--has-bottom': bottom,
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
							eventName="calypso_dashboard_overview_card_impression"
							properties={ { feature: tracksId, intent } }
						/>
					) ) }
				{ renderContent() }
				{ bottom && (
					<>
						<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />
						<VStack spacing={ 2 } className="dashboard-overview-card__content">
							{ bottom }
						</VStack>
					</>
				) }
			</CardBody>
		</Card>
	);
}
