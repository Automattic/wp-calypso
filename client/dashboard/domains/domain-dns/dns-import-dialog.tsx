import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { DnsRecord } from '../../data/domain-dns-records';

interface DnsImportDialogProps {
	isOpen: boolean;
	records: DnsRecord[];
	onConfirm: () => void;
	onCancel: () => void;
	isBusy?: boolean;
}

export default function DnsImportDialog( {
	isOpen,
	records,
	onConfirm,
	onCancel,
	isBusy = false,
}: DnsImportDialogProps ) {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal title={ __( 'Import DNS Records' ) } onRequestClose={ onCancel }>
			<VStack spacing={ 6 }>
				<Text>
					{ __(
						'The following DNS records will be imported. Please review them before confirming.'
					) }
				</Text>

				{ records.length > 0 && (
					<VStack spacing={ 3 }>
						<Text>{ __( 'Records to import:' ) }</Text>
						<VStack spacing={ 2 }>
							{ records.map( ( record, index ) => (
								<div
									key={ `${ record.type }-${ record.name }-${ index }` }
									style={ {
										padding: '12px',
										border: '1px solid #ddd',
										borderRadius: '4px',
										backgroundColor: '#f9f9f9',
									} }
								>
									<HStack justify="space-between" alignment="flex-start">
										<VStack spacing={ 2 } style={ { flex: 1 } }>
											<HStack spacing={ 2 }>
												<Text>{ record.type }</Text>
												<Text>{ record.name }</Text>
											</HStack>
											<Text>{ record.data || record.value || '-' }</Text>
											{ record.ttl && <Text>{ `TTL: ${ record.ttl.toString() }` }</Text> }
										</VStack>
									</HStack>
								</div>
							) ) }
						</VStack>
					</VStack>
				) }

				<HStack justify="flex-end" spacing={ 2 }>
					<Button onClick={ onCancel } isBusy={ isBusy }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" isBusy={ isBusy } onClick={ onConfirm }>
						{ __( 'Import Records' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
