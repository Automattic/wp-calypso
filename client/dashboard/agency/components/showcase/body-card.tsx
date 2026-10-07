import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Card, CardBody } from '../../../components/card';
import type { ReactNode } from 'react';

import './accents.scss';
import './body-card.scss';

export default function BodyCard( {
	title,
	byline,
	description,
	tile,
	actions,
}: {
	title: string;
	byline: ReactNode;
	description?: string;
	tile: ReactNode;
	actions?: ReactNode;
} ) {
	return (
		<Card className="dashboard-body-card">
			<CardBody className="dashboard-body-card__body">
				<VStack spacing={ 3 } justify="flex-start" className="dashboard-body-card__stack">
					<HStack spacing={ 3 } justify="flex-start">
						{ tile }
						<VStack spacing={ 0 }>
							<Text weight={ 600 } size={ 15 } lineHeight="20px">
								{ title }
							</Text>
							<Text variant="muted" size={ 13 } className="dashboard-body-card__byline">
								{ byline }
							</Text>
						</VStack>
					</HStack>
					{ description && (
						<Text
							variant="muted"
							lineHeight="20px"
							truncate
							numberOfLines={ 2 }
							className="dashboard-body-card__description"
						>
							{ description }
						</Text>
					) }
					{ actions && (
						<VStack spacing={ 3 } alignment="topLeft" className="dashboard-body-card__foot">
							{ actions }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
