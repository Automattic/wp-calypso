import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../../components/card';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import type { DNSRecord } from '../types';

interface RecordsListProps {
	records: DNSRecord[];
	justValues?: boolean;
}

export default function RecordsList( { records, justValues = false }: RecordsListProps ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	if ( records.length === 0 ) {
		return null;
	}

	const handleCopy = ( label?: React.ReactNode ) => {
		if ( ! label ) {
			return;
		}

		createSuccessNotice(
			sprintf(
				/* translators: %s is the copied field */
				__( 'Copied %s to clipboard.' ),
				label
			),
			{
				type: 'snackbar',
			}
		);
	};

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
									<ClipboardInputControl
										value={ record.name }
										readOnly
										__next40pxDefaultSize
										onCopy={ handleCopy }
										label={ __( 'Name' ) }
										hideLabelFromVision
									/>
									<ClipboardInputControl
										value={ record.value }
										readOnly
										__next40pxDefaultSize
										onCopy={ handleCopy }
										label={ __( 'Value' ) }
										hideLabelFromVision
									/>
								</Grid>
							</HStack>
						) ) }

					{ justValues && (
						<VStack spacing={ 2 }>
							{ records.map( ( record, index ) => (
								<ClipboardInputControl
									key={ index }
									value={ record.value }
									readOnly
									__next40pxDefaultSize
									onCopy={ handleCopy }
									label={ __( 'Value' ) }
									hideLabelFromVision
								/>
							) ) }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
