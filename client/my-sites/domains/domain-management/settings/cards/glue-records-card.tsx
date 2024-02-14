import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useCreateGlueRecordMutation from 'calypso/data/domains/glue-records/use-create-glue-record-mutation';
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
	id: `glue-records-notification`,
};

export default function GlueRecordsCard( { domain }: { domain: ResponseDomain } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ isRemoving, setIsRemoving ] = useState( false );
	const [ isAdding, setIsAdding ] = useState( false );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ nameserver, setNameserver ] = useState( '' );
	const [ ipAddress, setIpAddress ] = useState( '' );
	const [ isValidNameserver, setIsValidNameserver ] = useState( true );
	const [ isValidIpAddress, setIsValidIpAddress ] = useState( true );

	const {
		data,
		isFetching: isLoadingData,
		isError,
		isStale,
		refetch: refetchGlueRecordsData,
	} = useDomainGlueRecordsQuery( domain.name );

	const clearState = () => {
		setIsAdding( false );
		setIsEditing( false );
		setNameserver( '' );
		setIpAddress( '' );
		setIsSaving( false );
		setIsRemoving( false );
		setIsValidNameserver( true );
		setIsValidIpAddress( true );
	};

	// Display success notices when the glue record is created
	const { createGlueRecord } = useCreateGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record updated.' ), noticeOptions ) );
			clearState();
		},
		onError( error ) {
			dispatch( errorNotice( error.message, noticeOptions ) );
			clearState();
		},
	} );

	// Display success notices when the glue record is updated
	const { updateGlueRecord } = useUpdateGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record created and enabled.' ), noticeOptions ) );
			refetchGlueRecordsData();
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
		setIsAdding( true );
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

	const handleNameserverChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const nameserver = event.target.value;

		setNameserver( nameserver.toLowerCase() );
	};

	const handleDelete = ( record: GlueRecordObject ) => {
		setIsRemoving( true );
		deleteGlueRecord( record );

		recordTracksEvent( 'calypso_domain_glue_records_delete_record', {
			domain: domain.domain,
			record: record.nameserver,
			address: record.address,
		} );
	};

	const handleEdit = ( record: GlueRecordObject ) => {
		setNameserver( record.nameserver.replace( `.${ domain.domain }`, '' ) );
		setIpAddress( record.address );
		setIsEditing( true );
	};

	const validateNameserver = () => {
		if ( ! nameserver ) {
			return false;
		}
		// The subdomain part of name servers in Key-Systems cannot be longer than 50 characters
		if (
			nameserver.length > 50 ||
			! nameserver.match(
				/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
			)
		) {
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
		const nameserverIsValid = validateNameserver();
		const ipAddressIsValid = validateIpAddress();
		setIsValidNameserver( nameserverIsValid );
		setIsValidIpAddress( ipAddressIsValid );

		return nameserverIsValid && ipAddressIsValid;
	};

	const handleSubmit = () => {
		if ( ! validateGlueRecord() ) {
			return;
		}

		setIsSaving( true );

		if ( isEditing ) {
			updateGlueRecord( {
				nameserver: `${ nameserver }.${ domain.domain }`,
				address: ipAddress,
			} );
		} else {
			createGlueRecord( {
				nameserver: `${ nameserver }.${ domain.domain }`,
				address: ipAddress,
			} );
		}

		recordTracksEvent(
			isEditing
				? 'calypso_domain_glue_records_update_record'
				: 'calypso_domain_glue_records_add_record',
			{
				domain: domain.domain,
				nameserver: `${ nameserver }.${ domain.domain }`,
				address: ipAddress,
			}
		);
	};

	const handleCancel = () => {
		clearState();

		if ( data && data.length === 0 ) {
			setIsExpanded( false );
		}
	};

	const FormViewRow = ( { child: child }: { child: GlueRecordObject } ) => (
		<FormFieldset key={ `view-${ child.nameserver }` }>
			<div className="domain-glue-records-card__fields">
				<div className="glue-record-data">
					<div className="domain-glue-records-card__fields-row">
						<div className="label">{ translate( 'Name server' ) }:</div>
						<div className="value">
							<strong>{ child.nameserver }</strong>
						</div>
					</div>

					<div className="domain-glue-records-card__fields-row">
						<div className="label">{ translate( 'IP address' ) }:</div>
						<div className="value">
							<strong>{ child.address }</strong>
						</div>
					</div>
				</div>
				<div>
					<Button
						scary
						disabled={ isSaving || isRemoving }
						className="edit-glue-record-button"
						onClick={ () => handleEdit( child ) }
					>
						<Gridicon icon="pencil" />
						{ translate( 'Edit' ) }
					</Button>
					<Button
						scary
						disabled={ isSaving || isRemoving }
						className="delete-glue-record-button"
						onClick={ () => handleDelete( child ) }
					>
						<Gridicon icon="trash" />
						{ translate( 'Remove' ) }
					</Button>
				</div>
			</div>
		</FormFieldset>
	);

	const FormRowEditable = ( {
		child,
		isEditing = false,
	}: {
		child: GlueRecordObject;
		isEditing: boolean;
	} ) => (
		<>
			<FormFieldset key={ `edit-${ child.nameserver }` }>
				<FormLabel>{ translate( 'Name server' ) }</FormLabel>
				<div>
					<FormTextInputWithAffixes
						placeholder={ translate( 'Enter subdomain (e.g. ns1)' ) }
						disabled={ isLoadingData || isSaving || isEditing }
						name="nameserver"
						onChange={ handleNameserverChange }
						value={ nameserver }
						maxLength={ 1000 }
						suffix={ <FormLabel>.{ domain.domain }</FormLabel> }
						isError={ ! isValidNameserver }
					/>
					{ ! isValidNameserver && (
						<div className="domain-glue-records-card__error-field">
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
						<div className="domain-glue-records-card__error-field">
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

	const expandCard = () => {
		setIsExpanded( true );
		// We want to always fetch the latest glue record when the card is expanded
		// otherwise the user might see stale data if they made an update and refreshed the page
		refetchGlueRecordsData();

		recordTracksEvent( 'calypso_domain_glue_records_expand_card_click', {
			domain: domain.domain,
		} );
	};

	const renderGlueRecords = () => {
		if ( isLoadingData || ! data ) {
			return (
				<div className="domain-glue-records-card">
					<div className="domain-glue-records-card is-placeholder"></div>
				</div>
			);
		}

		return (
			<div className="domain-glue-records-card">
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						return false;
					} }
				>
					{ data?.map( ( item ) => FormViewRow( { child: item } ) ) }
					{ isAdding &&
						FormRowEditable( {
							child: {
								nameserver: '',
								address: '',
							},
							isEditing: false,
						} ) }
					{ isEditing &&
						FormRowEditable( {
							child: {
								nameserver,
								address: ipAddress,
							},
							isEditing: true,
						} ) }
				</form>

				{ ! isAdding && data && data.length < 3 && (
					<Button borderless className="link-button" onClick={ () => showGlueRecordForm() }>
						{ translate( '+ Add Glue Record' ) }
					</Button>
				) }
			</div>
		);
	};

	return (
		<Accordion
			className="domain-glue-records-card__accordion"
			title={ translate( 'Glue Records' ) }
			subtitle={ translate( 'Edit your private name servers (glue records)' ) }
			expanded={ isExpanded }
			onOpen={ expandCard }
			onClose={ () => setIsExpanded( false ) }
		>
			{ renderGlueRecords() }
		</Accordion>
	);
}
