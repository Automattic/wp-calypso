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
import { useEffect, useRef } from 'react';
import { Card, CardBody } from '../../../components/card';
import { getSpacefastUrl } from './constants';
import SpacefastLogo from './spacefast-logo';
import type { RecordTracksEvent } from '../../tiers/types';

import './dev-tools-section.scss';

/**
 * Leads the Dev tools page during the Spacefast launch, in both the dashboard
 * and a8c-for-agencies. It follows the page's dev tool cards, laid out wide.
 */
export default function SpacefastDevToolsSection( {
	recordTracksEvent,
}: {
	recordTracksEvent: RecordTracksEvent;
} ) {
	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'dev_tools' } );
		}
	}, [ recordTracksEvent ] );

	const features = [
		__( 'Publish a prototype, report, or app in seconds' ),
		__( 'Keep each space private, shared, or public' ),
		__( 'Connect a custom domain when it’s ready to go live' ),
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
								<Badge intent="draft">{ __( 'Publish & share' ) }</Badge>
							</HStack>
							<Text weight={ 500 }>{ __( 'A home for everything your agents make' ) }</Text>
						</VStack>
						<Text size={ 15 }>
							{ __(
								'Publish the pages, prototypes, reports, and apps your team makes with AI agents, straight from the agent, and share one link with clients for feedback.'
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
