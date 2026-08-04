import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { caution } from '../../components/notice/icons';
import { Text } from '../../components/text';
import { PARTNER_PROGRAM_GUIDE_URL } from './constants';
import NewTabLabel from './new-tab-label';
import type { RecordTracksEvent } from '../tiers/types';
import type { ReactNode } from 'react';

function ApplicationStatusCard( {
	decoration,
	label,
	heading,
	children,
}: {
	decoration: ReactNode;
	label: string;
	heading: string;
	children: ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
						{ decoration }
						<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
							{ label }
						</Text>
					</HStack>
					<VStack spacing={ 2 }>
						<Heading level={ 2 } size={ 20 } weight={ 500 }>
							{ heading }
						</Heading>
						{ children }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

export function PendingTierCard( {
	onRelaunchTour,
	recordTracksEvent,
}: {
	onRelaunchTour?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<ApplicationStatusCard
			decoration={
				<Icon icon={ published } size={ 24 } style={ { fill: 'var(--wp-admin-theme-color)' } } />
			}
			label={ __( 'Welcome' ) }
			heading={ __( 'We’re reviewing your account' ) }
		>
			<Text variant="muted" lineHeight="20px">
				{ __(
					'While we review, you can’t make purchases yet, but feel free to explore the tools and set up your agency profile. Most are activated within one business day.'
				) }
			</Text>
			<ButtonStack justify="flex-start" style={ { paddingTop: '8px' } }>
				<Button
					size="compact"
					variant="primary"
					href={ PARTNER_PROGRAM_GUIDE_URL }
					target="_blank"
					rel="noreferrer"
					onClick={ () =>
						recordTracksEvent?.( 'calypso_a4a_overview_tier_card_program_guide_click' )
					}
				>
					<NewTabLabel>{ __( 'Read the partner program guide' ) }</NewTabLabel>
				</Button>
				{ onRelaunchTour && (
					<Button
						size="compact"
						variant="tertiary"
						onClick={ () => {
							recordTracksEvent?.( 'calypso_a4a_overview_relaunch_welcome_tour_click' );
							onRelaunchTour();
						} }
					>
						{ __( 'Relaunch welcome tour' ) }
					</Button>
				) }
			</ButtonStack>
		</ApplicationStatusCard>
	);
}

export function RejectedTierCard( { contactSupportHref }: { contactSupportHref: string } ) {
	return (
		<ApplicationStatusCard
			decoration={
				<Text intent="error" as="span">
					<Icon icon={ caution } size={ 24 } fill="currentColor" />
				</Text>
			}
			label={ __( 'Application status' ) }
			heading={ __( 'Your application wasn’t approved' ) }
		>
			<Text variant="muted" lineHeight="20px">
				{ __( 'We have not approved your application for the Automattic for Agencies program.' ) }
			</Text>
			<Text variant="muted" lineHeight="20px">
				{ createInterpolateElement(
					__(
						'Please <a>contact support</a> to discuss this further if you think this was done in error.'
					),
					{ a: <a href={ contactSupportHref } /> }
				) }
			</Text>
		</ApplicationStatusCard>
	);
}
