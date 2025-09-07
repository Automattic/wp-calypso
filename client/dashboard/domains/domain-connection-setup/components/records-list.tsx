import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ClipboardButton from './clipboard-button';
import type { DNSRecord } from '../types';

interface RecordsListProps {
	records: DNSRecord[];
	justValues?: boolean;
}

export default function RecordsList( { records, justValues = false }: RecordsListProps ) {
	if ( records.length === 0 ) {
		return null;
	}

	return (
		<Card variant="secondary">
			<CardBody>
				<VStack spacing={ 3 }>
					{ ! justValues && (
						<HStack>
							<div style={ { width: '80px' } }>{ __( 'Type' ) }</div>
							<div style={ { width: '290px' } }>{ __( 'Name' ) }</div>
							<div style={ { width: '290px' } }>{ __( 'Value' ) }</div>
						</HStack>
					) }

					{ ! justValues &&
						records.map( ( record, index ) => (
							<HStack key={ index } spacing={ 2 }>
								<div style={ { width: '80px', fontSize: '14px' } }>{ record.type }</div>
								<div style={ { width: '290px' } }>
									<ClipboardButton text={ record.name } />
								</div>
								<div style={ { width: '290px' } }>
									<ClipboardButton text={ record.value } />
								</div>
							</HStack>
						) ) }

					{ justValues && (
						<VStack spacing={ 2 }>
							{ records.map( ( record, index ) => (
								<div style={ { width: '290px' } } key={ index }>
									<ClipboardButton text={ record.value } />
								</div>
							) ) }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
