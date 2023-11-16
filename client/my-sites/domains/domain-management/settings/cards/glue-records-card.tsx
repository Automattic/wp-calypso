import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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

	const { data, isLoading: isLoadingData, isError } = useDomainGlueRecordsQuery( domain.name );

	// Manage local state for target url and protocol as we split forwarding target into host, path and protocol when we store it
	const [ isSaving, setIsSaving ] = useState( false );
	const [ isRemoving, setIsRemoving ] = useState( false );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ record, setRecord ] = useState( '' );
	const [ ipAddress, setIpAddress ] = useState( '' );

	const clearState = () => {
		setIsEditing( false );
		setRecord( '' );
		setIpAddress( '' );
		setIsSaving( false );
		setIsRemoving( false );
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

	// Display success notices when the forwarding is deleted
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

	const handleAddGlueRecord = () => {
		setIsEditing( true );
	};

	useEffect( () => {
		if ( isLoadingData || ! data ) {
			return;
		}

		// By default, the interface already opens with domain forwarding addition
		if ( data?.length === 0 ) {
			handleAddGlueRecord();
		}
	}, [ isLoadingData, data ] );

	const handleIpAddressChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const ipAddress = event.target.value;

		setIpAddress( ipAddress );
	};

	const glueRecordValidation = () => {
		return true;
	};

	const handleRecordChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const record = event.target.value;

		setRecord( record );
	};

	const handleDelete = ( record: string ) => {
		setIsRemoving( true );
		deleteGlueRecord( record );
	};

	const handleSubmit = () => {
		setIsSaving( true );
		updateGlueRecord( {
			record: record,
			address: ipAddress,
		} );
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
						onClick={ () => handleDelete( child.record ) }
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
					/>
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
						onBlur={ glueRecordValidation }
						value={ ipAddress }
						// className={ classNames( { 'is-error': ! isValidUrl } ) }
						maxLength={ 1000 }
						/* suffix={
							<Button className="forwarding__clear" onClick={ cleanGlueRecordInput }>
								<Gridicon icon="cross" />
							</Button>
						} */
					/>
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
						onClick={ () => clearState() }
						type="button"
						isPrimary={ false }
					>
						{ translate( 'Cancel' ) }
					</FormButton>
				</div>
			</FormFieldset>
		</>
	);

	return (
		<>
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

			<Button
				borderless
				className="add-forward-button  link-button"
				onClick={ () => handleAddGlueRecord() }
			>
				{ translate( '+ Add Glue Record' ) }
			</Button>
		</>
	);
}
