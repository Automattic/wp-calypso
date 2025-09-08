import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalText as Text,
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
						<HStack justify="flex-start">
							<Text style={ { width: '80px' } } weight={ 500 }>
								{ __( 'Type' ) }
							</Text>
							<Grid columns={ 2 } style={ { width: '100%' } } templateColumns="50% 50%">
								<Text weight={ 500 }>{ __( 'Name' ) }</Text>
								<Text weight={ 500 }>{ __( 'Value' ) }</Text>
							</Grid>
						</HStack>
					) }

					{ ! justValues &&
						records.map( ( record, index ) => (
							<HStack justify="flex-start" key={ index } spacing={ 2 }>
								<Text style={ { width: '80px' } }>{ record.type }</Text>
								<Grid columns={ 2 } style={ { width: '100%' } } templateColumns="50% 50%">
									<ClipboardButton text={ record.name } />
									<ClipboardButton text={ record.value } />
								</Grid>
							</HStack>
						) ) }

					{ justValues && (
						<VStack spacing={ 2 }>
							{ records.map( ( record, index ) => (
								<ClipboardButton key={ index } text={ record.value } />
							) ) }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
