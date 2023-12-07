import { Button, FormInputValidation, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useDeleteGlueRecordMutation from 'calypso/data/domains/glue-records/use-delete-glue-record-mutation';
import useDomainGlueRecordsQuery, {
	GlueRecordObject,
} from 'calypso/data/domains/glue-records/use-domain-glue-records-query';
import useUpdateGlueRecordMutation from 'calypso/data/domains/glue-records/use-update-glue-record-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-forwarding-notification`,
};

export default function GlueRecordsCard( { domain }: { domain: ResponseDomain } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ isRemoving, setIsRemoving ] = useState( false );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ record, setRecord ] = useState( '' );
	const [ ipAddress, setIpAddress ] = useState( '' );
	const [ isValidRecord, setIsValidRecord ] = useState( true );
	const [ isValidIpAddress, setIsValidIpAddress ] = useState( true );

	const {
		data,
		isFetching: isLoadingData,
		isError,
		isStale,
		refetch: refetchGlueRecordsData,
	} = useDomainGlueRecordsQuery( domain.name );

	const clearState = () => {
		setIsEditing( false );
		setRecord( '' );
		setIpAddress( '' );
		setIsSaving( false );
		setIsRemoving( false );
		setIsValidRecord( true );
		setIsValidIpAddress( true );
	};

	// Display success notices when the glue record is updated
	const { updateGlueRecord } = useUpdateGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record updated and enabled.' ), noticeOptions ) );
			clearState();
		},
		onError( error ) {
			dispatch( errorNotice( error.message, noticeOptions ) );
			clearState();
		},
	} );

	// Display success notices when the glue record is deleted
	const { deleteGlueRecord } = useDeleteGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record deleted successfully.' ), noticeOptions ) );
			clearState();
		},
		onError() {
			dispatch(
				errorNotice(
					translate( 'An error occurred while deleting the glue record.' ),
					noticeOptions
				)
			);
			clearState();
		},
	} );

	// Render an error if the glue record fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching your glue record.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	const showGlueRecordForm = () => {
		setIsEditing( true );
	};

	useEffect( () => {
		if ( isExpanded && isStale ) {
			refetchGlueRecordsData();
		}
	}, [ isExpanded, isStale, refetchGlueRecordsData ] );

	useEffect( () => {
		if ( isLoadingData || ! data ) {
			return;
		}

		// If there are no glue records, start with the form to add one open
		if ( data?.length === 0 ) {
			showGlueRecordForm();
		}
	}, [ isLoadingData, data, isExpanded ] );

	const handleIpAddressChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const ipAddress = event.target.value;

		setIpAddress( ipAddress );
	};

	const handleRecordChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const record = event.target.value;

		setRecord( record.toLowerCase() );
	};

	const handleDelete = ( record: GlueRecordObject ) => {
		setIsRemoving( true );
		deleteGlueRecord( record );
	};

	const validateRecord = () => {
		if ( ! record ) {
			return false;
		}
		if ( ! record.match( /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/ ) ) {
			return false;
		}
		return true;
	};

	const validateIpAddress = () => {
		if ( ! ipAddress ) {
			return false;
		}
		if ( ! ipAddress.match( /^(\d{1,3}\.){3}\d{1,3}$/ ) ) {
			return false;
		}
		return true;
	};

	const validateGlueRecord = () => {
		const recordIsValid = validateRecord();
		const ipAddressIsValid = validateIpAddress();
		setIsValidRecord( recordIsValid );
		setIsValidIpAddress( ipAddressIsValid );

		return recordIsValid && ipAddressIsValid;
	};

	const handleSubmit = () => {
		if ( ! validateGlueRecord() ) {
			return;
		}

		setIsSaving( true );
		updateGlueRecord( {
			record: `${ record }.${ domain.domain }`,
			address: ipAddress,
		} );
	};

	const handleCancel = () => {
		clearState();

		if ( data && data.length === 0 ) {
			setIsExpanded( false );
		}
	};

	const FormViewRow = ( { child: child }: { child: GlueRecordObject } ) => (
		<FormFieldset className="domain-forwarding-card__fields" key={ `view-${ child.record }` }>
			<div className="domain-forwarding-card__fields-row">
				<div className="domain-forwarding-card__fields-column glue-record-data">
					<div className="domain-forwarding-card__fields-row addresses">
						<div className="domain-forwarding-card__fields-column source">
							{ translate( 'Name server' ) }:
						</div>
						<div className="domain-forwarding-card__fields-column destination">
							<strong>{ child.record }</strong>
						</div>
					</div>

					<div className="domain-forwarding-card__fields-row addresses">
						<div className="domain-forwarding-card__fields-column source">
							{ translate( 'IP address' ) }:
						</div>
						<div className="domain-forwarding-card__fields-column destination">
							<strong>{ child.address }</strong>
						</div>
					</div>
				</div>
				<div className="domain-forwarding-card__fields-column">
					<Button
						scary
						disabled={ isSaving || isRemoving }
						className="edit-redirect-button"
						onClick={ () => handleDelete( child ) }
					>
						<Gridicon icon="trash" />
						{ translate( 'Remove' ) }
					</Button>
				</div>
			</div>
		</FormFieldset>
	);

	const FormRowEditable = ( { child }: { child: GlueRecordObject } ) => (
		<>
			<FormFieldset className="domain-forwarding-card__fields" key={ `edit-${ child.record }` }>
				<FormLabel>{ translate( 'Name server' ) }</FormLabel>
				<div className="glue-record-input-wrapper">
					<FormTextInputWithAffixes
						placeholder={ translate( 'Enter subdomain (e.g. ns1)' ) }
						disabled={ isLoadingData || isSaving }
						name="record"
						onChange={ handleRecordChange }
						value={ record }
						maxLength={ 1000 }
						suffix={ <FormLabel>.{ domain.domain }</FormLabel> }
						isError={ ! isValidRecord }
					/>
					{ ! isValidRecord && (
						<div className="domain-forwarding-card__error-field">
							<FormInputValidation isError text={ translate( 'Invalid subdomain' ) } />
						</div>
					) }
				</div>
				<FormLabel>{ translate( 'IP address' ) }</FormLabel>
				<div className="ip-address">
					<FormTextInputWithAffixes
						disabled={ isLoadingData || isSaving }
						placeholder={ translate( 'e.g. %(example)s', {
							args: {
								example: '123.45.78.9',
							},
						} ) }
						name="ip-address"
						noWrap
						onChange={ handleIpAddressChange }
						value={ ipAddress }
						maxLength={ 1000 }
						isError={ ! isValidIpAddress }
					/>
					{ ! isValidIpAddress && (
						<div className="domain-forwarding-card__error-field">
							<FormInputValidation isError text={ translate( 'Invalid IP address' ) } />
						</div>
					) }
				</div>
				<div className="glue-records__action-buttons">
					<FormButton
						busy={ isSaving }
						onClick={ handleSubmit }
						disabled={ isLoadingData || isSaving }
					>
						{ translate( 'Save' ) }
					</FormButton>
					<FormButton
						disabled={ isSaving }
						onClick={ handleCancel }
						type="button"
						isPrimary={ false }
					>
						{ translate( 'Cancel' ) }
					</FormButton>
				</div>
			</FormFieldset>
		</>
	);

	const renderGlueRecords = () => {
		if ( isLoadingData || ! data ) {
			return (
				<div className="domain-glue-records">
					<div className="domain-glue-records is-placeholder"></div>
				</div>
			);
		}

		return (
			<div className="domain-glue-records">
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						return false;
					} }
				>
					{ data?.map( ( item ) => FormViewRow( { child: item } ) ) }
					{ isEditing &&
						FormRowEditable( {
							child: {
								record: '',
								address: '',
							},
						} ) }
				</form>

				{ ! isEditing && data && data.length < 3 && (
					<Button
						borderless
						className="add-forward-button  link-button"
						onClick={ () => showGlueRecordForm() }
					>
						{ translate( '+ Add Glue Record' ) }
					</Button>
				) }
			</div>
		);
	};

	return (
		<Accordion
			className="domain-forwarding-card__accordion"
			title={ translate( 'Glue Records' ) }
			subtitle={ translate( 'Edit your private name servers (glue records)' ) }
			expanded={ isExpanded }
			onOpen={ () => setIsExpanded( true ) }
			onClose={ () => setIsExpanded( false ) }
		>
			{ renderGlueRecords() }
		</Accordion>
	);
}
