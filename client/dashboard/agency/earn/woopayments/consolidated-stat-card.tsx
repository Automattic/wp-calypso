import {
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Popover,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { TextSkeleton } from '../../../components/text-skeleton';

import './consolidated-stat-card.scss';

interface ConsolidatedStatCardProps {
	value: string | number;
	footerText: string;
	footerAction?: React.ReactNode;
	popoverTitle?: string;
	popoverContent: React.ReactNode;
	isLoading?: boolean;
}

export default function ConsolidatedStatCard( {
	value,
	footerText,
	footerAction,
	popoverTitle,
	popoverContent,
	isLoading = false,
}: ConsolidatedStatCardProps ) {
	const [ showPopover, setShowPopover ] = useState( false );
	const [ infoAnchor, setInfoAnchor ] = useState< HTMLButtonElement | null >( null );

	return (
		<Card className="woopayments-stat-card">
			<CardBody>
				<VStack spacing={ 3 }>
					<Heading level={ 2 } className="woopayments-stat-card__value">
						{ isLoading ? <TextSkeleton length={ 8 } /> : value }
					</Heading>
					<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
						<Text variant="muted">{ footerText }</Text>
						<Button
							ref={ setInfoAnchor }
							className="woopayments-stat-card__info-icon"
							aria-label={ popoverTitle }
							onClick={ () => setShowPopover( ( visible ) => ! visible ) }
						>
							<Icon icon={ info } size={ 16 } />
						</Button>
						{ showPopover && (
							<Popover
								className="woopayments-stat-card__popover"
								anchor={ infoAnchor }
								placement="bottom"
								offset={ 12 }
								focusOnMount
								onFocusOutside={ () => setShowPopover( false ) }
							>
								{ popoverContent }
							</Popover>
						) }
					</HStack>
					{ footerAction }
				</VStack>
			</CardBody>
		</Card>
	);
}
