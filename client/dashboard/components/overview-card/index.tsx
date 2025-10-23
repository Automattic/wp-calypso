import CircularProgressBar from '@automattic/components/src/circular-progress-bar';
import { Link } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useAnalytics } from '../../app/analytics';
import { isRelativeUrl } from '../../utils/url';
import ComponentViewTracker from '../component-view-tracker';
import { Text } from '../text';
import { TextSkeleton } from '../text-skeleton';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import './style.scss';

export interface OverviewCardProps {
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

	/**
	 * Will open in the same tab if the link is relative, otherwise it will open in a new tab.
	 */
	link?: string;

	/**
	 * Will always open in a new tab.
	 */
	externalLink?: string;

	tracksId?: string;

	upsellFeatureId?: string;

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
	externalLink: externalLinkProp,
	tracksId,
	upsellFeatureId,
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

	const isRelativeLink = link && isRelativeUrl( link );

	let relativeLink: string | undefined = undefined;
	let externalLink: string | undefined = undefined;

	if ( externalLinkProp ) {
		externalLink = externalLinkProp;
	} else if ( isRelativeLink ) {
		relativeLink = link;
	} else {
		externalLink = link;
	}

	const topContent = (
		<HStack
			className="dashboard-overview-card__content"
			justify="space-between"
			alignment="flex-start"
		>
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
					{ relativeLink && ! progress && (
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
							intent={ intent === 'warning' || intent === 'error' ? intent : undefined }
							variant={ intent === 'warning' || intent === 'error' ? undefined : 'muted' }
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
					upsell_id: tracksId,
					upsell_feature_id: upsellFeatureId,
				} );
			} else {
				recordTracksEvent( 'calypso_dashboard_overview_card_click', {
					card_id: tracksId,
					intent,
				} );
			}
		}
	};

	const renderContent = () => {
		if ( relativeLink ) {
			return (
				<Link to={ relativeLink } className="dashboard-overview-card__link" onClick={ handleClick }>
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
					rel="external noreferrer noopener"
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
							properties={ {
								upsell_id: tracksId,
								upsell_feature_id: upsellFeatureId,
							} }
						/>
					) : (
						<ComponentViewTracker
							eventName="calypso_dashboard_overview_card_impression"
							properties={ { card_id: tracksId, intent } }
						/>
					) ) }
				{ renderContent() }
				{ bottom && (
					<>
						<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />
						<VStack
							className="dashboard-overview-card__content"
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
