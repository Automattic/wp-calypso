import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import type { ReactNode } from 'react';

interface Props {
	/** What is selected, e.g. "3 WordPress.com sites" or the plan name. */
	label: ReactNode;
	price: ReactNode;
	/** Supporting lines under the price. */
	notes?: ReactNode;
	action: ReactNode;
	footnote?: ReactNode;
	/** The reassurance line under the divider, e.g. "Cancel anytime." */
	assurance?: ReactNode;
}

/** The purchase rail: what is selected, what it costs, and the call to action. */
export default function SelectedPlanCard( {
	label,
	price,
	notes,
	action,
	footnote,
	assurance,
}: Props ) {
	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'Currently selected' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<VStack spacing={ 2 }>
						<Text>{ label }</Text>
						{ price }
						{ notes }
					</VStack>
					{ action }
					{ footnote }
					{ assurance && (
						<>
							<CardDivider />
							<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
								<Icon icon={ check } className="dashboard-marketplace-hosting__rail-check" />
								<Text variant="muted">{ assurance }</Text>
							</HStack>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
