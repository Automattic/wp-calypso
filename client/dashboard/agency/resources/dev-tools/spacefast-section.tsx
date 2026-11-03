import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useCallback } from 'react';
import { Card, CardBody } from '../../../components/card';
import { getSpacefastUrl } from '../../components/spacefast/constants';
import SpacefastLogo from '../../components/spacefast/spacefast-logo';
import { useRecordViewOnce } from '../../lib/use-record-view-once';
import type { RecordTracksEvent } from '../../tiers/types';

import './spacefast-section.scss';

/**
 * Leads the Dev tools page during the Spacefast launch, in both the dashboard
 * and a8c-for-agencies. It follows the page's dev tool cards, laid out wide.
 */
export default function SpacefastDevToolsSection( {
	recordTracksEvent,
}: {
	recordTracksEvent: RecordTracksEvent;
} ) {
	useRecordViewOnce(
		'spacefast-dev-tools',
		useCallback(
			() => recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'dev_tools' } ),
			[ recordTracksEvent ]
		)
	);

	const features = [
		__(
			'Build client sites, prototypes, and internal agency tooling with database support, file uploads, and versioning included'
		),
		__(
			'Integrates seamlessly with the AI your team already uses, like Claude, ChatGPT, or Gemini'
		),
		__(
			'Keep client work safe in private spaces you invite people to, or make a space public and share it with the world'
		),
		__( 'Get feedback in real time from clients and colleagues with built-in comments' ),
		__(
			'Made by Automattic and built on the infrastructure that runs Pressable, WordPress.com, and more'
		),
	];

	return (
		<Card size="large" className="a4a-spacefast-dev-tools">
			<div className="a4a-spacefast-dev-tools__layout">
				<div className="a4a-spacefast-dev-tools__media">
					<SpacefastLogo className="a4a-spacefast-dev-tools__logo" />
				</div>
				<CardBody>
					<VStack spacing={ 4 } alignment="flex-start">
						<VStack spacing={ 2 }>
							<HStack alignment="left" wrap>
								<Heading level={ 2 } size={ 20 } weight={ 500 }>
									{ __( 'Spacefast' ) }
								</Heading>
								<Badge intent="stable">{ __( 'New' ) }</Badge>
								<Badge intent="draft">{ __( 'Build with AI' ) }</Badge>
							</HStack>
						</VStack>
						<Text size={ 15 }>
							{ __(
								'Your team already uses AI to make websites, apps, prototypes, proposals, and more. Spacefast gives your team one shared place to ship them in seconds, right from your agent and ready for clients to see.'
							) }
						</Text>
						<VStack
							as="ul"
							role="list"
							spacing={ 1 }
							style={ { margin: 0, padding: 0, listStyle: 'none' } }
						>
							{ features.map( ( feature ) => (
								<HStack as="li" key={ feature } alignment="topLeft" spacing={ 1 }>
									<Icon
										icon={ check }
										size={ 24 }
										style={ { flexShrink: 0, fill: 'var(--wp-admin-theme-color)' } }
									/>
									<Text size={ 15 } lineHeight="24px">
										{ feature }
									</Text>
								</HStack>
							) ) }
						</VStack>
						<Button
							__next40pxDefaultSize
							variant="primary"
							size="compact"
							href={ getSpacefastUrl( 'dev_tools' ) }
							target="_blank"
							rel="noreferrer"
							onClick={ () =>
								recordTracksEvent( 'calypso_a4a_spacefast_promo_click', {
									placement: 'dev_tools',
								} )
							}
						>
							{ __( 'Try Spacefast' ) }
						</Button>
					</VStack>
				</CardBody>
			</div>
		</Card>
	);
}
