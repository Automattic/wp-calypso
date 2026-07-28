import {
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Popover,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../card';
import { TextSkeleton } from '../text-skeleton';
import type { ReactNode } from 'react';

import './style.scss';

interface ConsolidatedStatCardProps {
	value: string | number;
	footerText: string;
	footerAction?: ReactNode;
	popoverTitle?: string;
	popoverContent?: ReactNode;
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
		<Card className="consolidated-stat-card">
			<CardBody>
				<VStack spacing={ 2 }>
					<Heading level={ 2 } size={ 20 } weight={ 500 }>
						{ isLoading ? <TextSkeleton length={ 8 } /> : value }
					</Heading>
					<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
						<Text variant="muted">{ footerText }</Text>
						{ popoverContent && (
							<>
								<Button
									size="small"
									icon={ info }
									iconSize={ 18 }
									ref={ setInfoAnchor }
									title={ __( 'Click to learn more' ) }
									aria-label={
										popoverTitle
											? sprintf(
													/* translators: %s is the name of the stat, e.g. "Total payouts" */
													__( 'Click to learn more about %s' ),
													popoverTitle
											  )
											: __( 'Click to learn more' )
									}
									onClick={ () => setShowPopover( ( visible ) => ! visible ) }
								/>
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
										<div className="consolidated-stat-card__popover-content">
											{ popoverContent }
										</div>
									</Popover>
								) }
							</>
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
