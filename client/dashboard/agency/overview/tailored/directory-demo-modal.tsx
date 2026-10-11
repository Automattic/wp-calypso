/**
 * PROTOTYPE — proof of concept only.
 *
 * Demo video modal for the growth plan (the program overview and the partner
 * directory walkthrough). Follows the Library's video modal
 * (agency/resources/learn/resource-center.tsx). The video area is a
 * placeholder until the demos are recorded.
 */
import {
	Button,
	Icon,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { video } from '@wordpress/icons';
import { Text } from '../../../components/text';

interface DirectoryDemoModalProps {
	title?: string;
	/** Lead-in before the call link. */
	callPrompt?: string;
	onClose: () => void;
	/** Label for the call link, e.g. "Schedule your free advisor call". */
	scheduleCallLabel: string;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
}

export default function DirectoryDemoModal( {
	title = __( 'How to get listed in the partner directories' ),
	callPrompt = __( 'Questions about getting listed?' ),
	onClose,
	scheduleCallLabel,
	onScheduleCall,
	isSchedulingCall,
}: DirectoryDemoModalProps ) {
	return (
		<Modal isDismissible size="large" onRequestClose={ onClose } title={ title }>
			<VStack spacing={ 4 }>
				{ /* 16:9 placeholder; swap in the iframe from the Library modal once the video exists. */ }
				<div
					role="img"
					aria-label={ __( 'Demo video placeholder' ) }
					style={ {
						aspectRatio: '16 / 9',
						borderRadius: '8px',
						background: 'var(--color-gray-100, #f0f0f0)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
					} }
				>
					<Icon icon={ video } size={ 48 } style={ { fill: 'var(--color-gray-600, #50575e)' } } />
					<Text variant="muted">{ __( 'Demo video coming soon' ) }</Text>
				</div>
				{ onScheduleCall && (
					<HStack spacing={ 2 } justify="flex-start" wrap>
						<Text variant="muted">{ callPrompt }</Text>
						<Button
							variant="link"
							isBusy={ isSchedulingCall }
							onClick={ () => {
								onClose();
								onScheduleCall();
							} }
						>
							{ scheduleCallLabel }
						</Button>
					</HStack>
				) }
			</VStack>
		</Modal>
	);
}
