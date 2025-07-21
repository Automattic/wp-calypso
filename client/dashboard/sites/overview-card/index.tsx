import { CircularProgressBar } from '@automattic/components';
import { Link } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Icon,
	ProgressBar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import './style.scss';

export interface OverviewCardProps {
	title: string;
	description?: string;
	link?: string;
	externalLink?: string;
	heading?: ReactNode;
	icon?: ReactElement;
	progress?: {
		value: number;
		max: number;
		label: string;
		variant?: ComponentProps< typeof CircularProgressBar >[ 'variant' ];
	};
	tracksId?: string;
	variant?: 'upsell' | 'disabled' | 'loading' | 'success' | 'error';
	bottom?: ReactNode;
	onClick?: () => void;
}

export default function OverviewCard( {
	description,
	externalLink,
	heading,
	icon,
	link,
	progress,
	title,
	tracksId,
	variant,
	bottom,
	onClick,
}: OverviewCardProps ) {
	const { recordTracksEvent } = useAnalytics();
	const isDisabled = variant === 'disabled';

	const topContent = (
		<HStack justify="space-between" className="dashboard-overview-card__content">
			<VStack spacing={ 4 } style={ { flexGrow: 1, flexShrink: 0 } }>
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
					{ externalLink && (
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
							variant={ isDisabled ? 'muted' : undefined }
							weight={ 500 }
						>
							{ heading }
						</Heading>
						{ description && (
							<Text
								className="dashboard-overview-card__description"
								variant="muted"
								lineHeight="16px"
								size={ 12 }
							>
								{ description }
							</Text>
						) }
					</VStack>
				</HStack>
				{ variant === 'loading' && <OverviewCardProgressBar /> }
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
			className={ clsx( 'dashboard-overview-card', {
				[ `dashboard-overview-card--${ variant }` ]: variant,
				'dashboard-overview-card--has-bottom': bottom,
			} ) }
			style={ {
				opacity: isDisabled ? 0.5 : 1,
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
				{ link && (
					<Link to={ link } className="dashboard-overview-card__link" onClick={ onClick }>
						{ topContent }
					</Link>
				) }
				{ ! link && externalLink && (
					<a
						href={ externalLink }
						className="dashboard-overview-card__link"
						target="_blank"
						rel="noreferrer"
						onClick={ () => {
							onClick?.();

							if ( tracksId ) {
								if ( variant === 'upsell' ) {
									recordTracksEvent( 'calypso_dashboard_upsell_click', {
										feature: tracksId,
										type: 'card',
									} );
								} else {
									recordTracksEvent( 'calypso_dashboard_overview_card_click', {
										type: tracksId,
										variant,
									} );
								}
							}
						} }
					>
						{ topContent }
					</a>
				) }
				{ ! link && ! externalLink && topContent }
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

export function OverviewCardProgressBar( { value }: { value?: number } ) {
	return <ProgressBar className="dashboard-overview-card__progress-bar" value={ value } />;
}
