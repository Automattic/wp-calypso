import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { ComponentProps } from 'react';
import ComponentViewTracker from '../../components/component-view-tracker';
import { upsell } from '../../components/icons';
import type { ReactNode } from 'react';

import './upsell-with-action-card.scss';

interface UpsellWithActionCardProps {
	actionText: string;
	actionVariant: ComponentProps< typeof Button >[ 'variant' ];
	description: ReactNode;
	image: string;
	imageAlt: string;
	title: string;
	trackId: string;
}

export default function UpsellWithActionCard( {
	actionText,
	actionVariant,
	description,
	image,
	imageAlt,
	title,
	trackId,
}: UpsellWithActionCardProps ) {
	return (
		<Card className="dashboard-overview-upsell-with-action-card">
			<CardBody style={ { padding: '0' } }>
				{ trackId && (
					<ComponentViewTracker
						eventName="calypso_dashboard_overview_card_impression"
						properties={ { type: trackId } }
					/>
				) }
				<HStack alignment="stretch" justify="space-between" spacing={ 6 } expanded={ false }>
					<VStack spacing={ 4 } style={ { padding: '24px' } }>
						<Text lineHeight="20px" size={ 15 } weight={ 500 }>
							{ title }
						</Text>
						<Text variant="muted">{ description }</Text>
						<Button icon={ upsell } text={ actionText } variant={ actionVariant } />
					</VStack>
					<VStack>
						<img src={ image } alt={ imageAlt } />
					</VStack>
				</HStack>
			</CardBody>
		</Card>
	);
}
