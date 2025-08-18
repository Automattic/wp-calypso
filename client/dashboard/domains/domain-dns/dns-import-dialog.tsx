import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	CheckboxControl,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import { domainDnsMutation } from '../../app/queries/domain-dns-records';
import type { DnsRecord } from '../../data/domain-dns-records';

interface DnsImportDialogProps {
	isOpen: boolean;
	domainName: string;
	records: DnsRecord[];
	onConfirm: () => void;
	onCancel: () => void;
}

export default function DnsImportDialog( {
	isOpen,
	domainName,
	records,
	onConfirm,
	onCancel,
}: DnsImportDialogProps ) {
	const [ selectedRecords, setSelectedRecords ] = useState< Set< string > >( new Set() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const updateDnsMutation = useMutation( domainDnsMutation( domainName ) );

	// Initialize all records as selected when records change
	useMemo( () => {
		if ( records.length > 0 ) {
			const allRecordIds = new Set( records.map( ( record, index ) => `record-${ index }` ) );
			setSelectedRecords( allRecordIds );
		}
	}, [ records ] );

	if ( ! isOpen ) {
		return null;
	}

	const numberOfSelectedRecords = selectedRecords.size;

	const toggleRecord = ( recordId: string ) => {
		const newSelectedRecords = new Set( selectedRecords );
		if ( newSelectedRecords.has( recordId ) ) {
			newSelectedRecords.delete( recordId );
		} else {
			newSelectedRecords.add( recordId );
		}
		setSelectedRecords( newSelectedRecords );
	};

	const toggleAllRecords = () => {
		if ( numberOfSelectedRecords === records.length ) {
			// If all are selected, unselect all
			setSelectedRecords( new Set() );
		} else {
			// If not all are selected, select all
			const allRecordIds = new Set( records.map( ( record, index ) => `record-${ index }` ) );
			setSelectedRecords( allRecordIds );
		}
	};

	const handleConfirm = () => {
		// Filter only selected records
		const selectedRecordsData = records.filter( ( record, index ) =>
			selectedRecords.has( `record-${ index }` )
		);

		// Use domainDnsMutation to add the selected records
		updateDnsMutation.mutate(
			{
				recordsToAdd: selectedRecordsData,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'DNS records imported successfully!' ), {
						type: 'snackbar',
					} );
					onConfirm();
				},
				onError: () => {
					createErrorNotice( __( 'Failed to import DNS records.' ), {
						type: 'snackbar',
					} );
					onCancel();
				},
			}
		);
	};

	const renderRecordAsString = ( record: DnsRecord ) => {
		const recordAsString = `${ record.name } ${ record.type }`;

		switch ( record.type ) {
			case 'A':
			case 'AAAA':
			case 'CNAME':
			case 'NS':
			case 'TXT':
				return `${ recordAsString } ${ record.data }`;
			case 'MX':
				return `${ recordAsString } ${ record.aux } ${ record.data }`;
			case 'SRV':
				return `${ record.service }.${ record.protocol }.${ recordAsString } ${ record.aux } ${ record.weight } ${ record.port } ${ record.data }`;
			default:
				return recordAsString;
		}
	};

	const renderHeader = () => {
		const headerLabel = `${ numberOfSelectedRecords !== 1 ? 's' : '' } selected`;

		return (
			<div style={ { marginBottom: '16px' } }>
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ numberOfSelectedRecords === records.length }
					indeterminate={ numberOfSelectedRecords > 0 && numberOfSelectedRecords < records.length }
					onChange={ toggleAllRecords }
					label={ `${ numberOfSelectedRecords } record${ headerLabel }` }
				/>
			</div>
		);
	};

	const renderRecordRow = ( record: DnsRecord, index: number ) => {
		const recordId = `record-${ index }`;
		const isSelected = selectedRecords.has( recordId );

		return (
			<div key={ index } style={ { marginBottom: '8px' } }>
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ isSelected }
					onChange={ () => toggleRecord( recordId ) }
					label={ renderRecordAsString( record ) }
				/>
			</div>
		);
	};

	return (
		<Modal title={ __( 'Import DNS Records' ) } onRequestClose={ onCancel }>
			<VStack spacing={ 6 }>
				<Text>
					{ __(
						'Select the DNS records you want to import. Please review them before confirming.'
					) }
				</Text>

				{ records.length > 0 ? (
					<>
						{ renderHeader() }
						<Divider />
						<div style={ { maxHeight: '300px', overflowY: 'auto' } }>
							{ records.map( ( record, index ) => renderRecordRow( record, index ) ) }
						</div>
					</>
				) : (
					<Text>{ __( "We couldn't find valid DNS records to import." ) }</Text>
				) }

				<HStack justify="flex-end" spacing={ 2 }>
					<Button onClick={ onCancel } disabled={ updateDnsMutation.isPending }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						isBusy={ updateDnsMutation.isPending }
						onClick={ handleConfirm }
						disabled={ numberOfSelectedRecords === 0 || updateDnsMutation.isPending }
					>
						{ __( 'Import Selected Records' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
