import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Icon,
	ProgressBar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import type { ReactElement, ReactNode } from 'react';
import './style.scss';

interface OverviewCardProps {
	title: string;
	customHeading?: ReactNode;
	description?: string;
	externalLink?: string;
	heading?: ReactNode;
	icon?: ReactElement;
	metaText?: string;
	trackId?: string;
	variant?: 'disabled' | 'loading' | 'success' | 'error';
	children?: ReactNode;
}

export default function OverviewCard( {
	customHeading,
	description,
	externalLink,
	heading,
	icon,
	metaText,
	title,
	trackId,
	variant,
	children,
}: OverviewCardProps ) {
	const { recordTracksEvent } = useAnalytics();
	const isDisabled = variant === 'disabled';

	const content = (
		<Card
			className={
				variant
					? `dashboard-overview-card dashboard-overview-card--${ variant }`
					: 'dashboard-overview-card'
			}
			style={ {
				opacity: isDisabled ? 0.5 : 1,
			} }
		>
			<CardBody>
				{ trackId && (
					<ComponentViewTracker
						eventName="calypso_dashboard_overview_card_impression"
						properties={ { type: trackId, variant } }
					/>
				) }
				<VStack spacing={ 4 }>
					<HStack justify="space-between">
						<HStack spacing={ 2 } alignment="center" expanded={ false }>
							{ icon && <Icon className="dashboard-overview-card__icon" icon={ icon } /> }
							<Text variant="muted" lineHeight="16px" size={ 11 } weight={ 500 } upperCase>
								{ title }
							</Text>
						</HStack>
						{ externalLink && (
							<span
								className="components-external-link__icon"
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
						{ customHeading ? (
							customHeading
						) : (
							<VStack spacing={ 2 }>
								<Heading
									level={ 2 }
									size={ 20 }
									variant={ isDisabled ? 'muted' : undefined }
									weight={ 500 }
								>
									{ heading }
								</Heading>
								{ metaText && <Text variant="muted">{ metaText }</Text> }
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
						) }
					</HStack>
					{ variant === 'loading' && <OverviewCardProgressBar /> }
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);

	if ( externalLink ) {
		return (
			<a
				href={ externalLink }
				className="dashboard-overview-card__link"
				target="_blank"
				rel="noreferrer"
				onClick={ () => {
					if ( ! trackId ) {
						return;
					}

					recordTracksEvent( 'calypso_dashboard_overview_card_click', {
						type: trackId,
						variant,
					} );
				} }
			>
				{ content }
			</a>
		);
	}

	return content;
}

export function OverviewCardProgressBar( { value }: { value?: number } ) {
	return <ProgressBar className="dashboard-overview-card__progress-bar" value={ value } />;
}
