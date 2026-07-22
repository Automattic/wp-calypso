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
		<Card className="referrals-stat-card">
			<CardBody>
				<VStack spacing={ 2 }>
					<Heading level={ 2 } size={ 20 } weight={ 500 }>
						{ isLoading ? <TextSkeleton length={ 8 } /> : value }
					</Heading>
					<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
						<Text variant="muted">{ footerText }</Text>
						<Button
							size="small"
							ref={ setInfoAnchor }
							aria-label={ popoverTitle }
							onClick={ () => setShowPopover( ( visible ) => ! visible ) }
						>
							<Icon icon={ info } size={ 16 } />
						</Button>
						{ showPopover && (
							<Popover
								anchor={ infoAnchor }
								placement="bottom"
								offset={ 12 }
								shift
								resize={ false }
								focusOnMount
								onFocusOutside={ () => setShowPopover( false ) }
							>
								<div className="referrals-stat-card__popover-content">{ popoverContent }</div>
							</Popover>
						) }
					</HStack>
					{ footerAction && (
						// VStack stretches its children, which would centre the button's label.
						<HStack justify="flex-start" expanded={ false }>
							{ footerAction }
						</HStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
