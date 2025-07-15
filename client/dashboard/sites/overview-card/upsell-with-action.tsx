import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { ComponentProps } from 'react';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import { upsell } from '../../components/icons';
import type { ReactNode } from 'react';

interface UpsellWithActionCardProps {
	action: Pick< ComponentProps< typeof Button >, 'href' | 'text' | 'variant' >;
	description: ReactNode;
	image: string;
	imageAlt: string;
	title: string;
	trackId: string;
}

export default function UpsellWithActionCard( {
	action,
	description,
	image,
	imageAlt,
	title,
	trackId,
}: UpsellWithActionCardProps ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<Card className="dashboard-overview-card-upsell-with-action">
			<CardBody style={ { padding: '0' } }>
				{ trackId && (
					<ComponentViewTracker
						eventName="calypso_dashboard_overview_card_impression"
						properties={ { type: trackId } }
					/>
				) }
				<HStack spacing={ 6 }>
					<VStack spacing={ 4 } style={ { flexGrow: 1, padding: '24px' } }>
						<Text lineHeight="20px" size={ 15 } weight={ 500 }>
							{ title }
						</Text>
						<Text variant="muted">{ description }</Text>
						<HStack expanded={ false }>
							<Button
								href={ action.href }
								icon={ upsell }
								target="_blank"
								text={ action.text }
								variant={ action.variant }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_overview_card_click', {
										type: trackId,
									} );
								} }
							/>
						</HStack>
					</VStack>
					<img src={ image } alt={ imageAlt } />
				</HStack>
			</CardBody>
		</Card>
	);
}
