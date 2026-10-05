import {
	Button,
	Popover,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import { CardBody } from '../../../components/card';

/** An info button next to a renamed plan's name, explaining what the plan used to be called. */
export default function PressableRenamedPlanNote( { formerName }: { formerName: string } ) {
	const [ anchor, setAnchor ] = useState< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<Button
				ref={ setAnchor }
				variant="tertiary"
				size="small"
				icon={ info }
				label={ __( 'About your plan name' ) }
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( open ) => ! open ) }
			/>
			{ isOpen && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					offset={ 8 }
					shift
					onClose={ () => setIsOpen( false ) }
				>
					<CardBody style={ { width: 'min(80vw, 320px)' } }>
						<VStack spacing={ 1 }>
							<Text weight={ 600 }>
								{ sprintf(
									/* translators: %s is the previous name of the plan, e.g. "Pressable Signature 2". */
									__( 'Formerly %s' ),
									formerName
								) }
							</Text>
							<Text variant="muted">
								{ __( 'Your price, features, sites, visits, and storage haven’t changed.' ) }
							</Text>
						</VStack>
					</CardBody>
				</Popover>
			) }
		</>
	);
}
