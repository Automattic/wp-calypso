import { Badge, Button } from '@automattic/components';
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

	const { data, isLoading, isError } = useDomainGlueRecordsQuery( domain.name );

	// Manage local state for target url and protocol as we split forwarding target into host, path and protocol when we store it
	const [ isEditing, setIsEditing ] = useState( false );
	const [ record, setRecord ] = useState( '' );
	const [ ipAddress, setIpAddress ] = useState( '' );

	const clearState = () => {
		setIsEditing( false );
		setRecord( '' );
		setIpAddress( '' );
	};

	// Display success notices when the glue record is updated
	const { updateGlueRecord } = useUpdateGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record updated and enabled.' ), noticeOptions ) );
			clearState();
		},
		onError( error ) {
			dispatch( errorNotice( error.message, noticeOptions ) );
		},
	} );

	// Display success notices when the forwarding is deleted
	const { deleteGlueRecord } = useDeleteGlueRecordMutation( domain.name, {
		onSuccess() {
			dispatch( successNotice( translate( 'Glue record deleted successfully.' ), noticeOptions ) );
		},
		onError() {
			dispatch(
				errorNotice(
					translate( 'An error occurred while deleting the glue record.' ),
					noticeOptions
				)
			);
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
		if ( isLoading || ! data ) {
			return;
		}

		// By default, the interface already opens with domain forwarding addition
		if ( data?.length === 0 ) {
			handleAddGlueRecord();
		}
	}, [ isLoading, data ] );

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
		deleteGlueRecord( record );
	};

	const handleSubmit = () => {
		updateGlueRecord( {
			record: record,
			address: ipAddress,
		} );
	};

	const FormViewRow = ( { child: child }: { child: GlueRecordObject } ) => (
		<FormFieldset className="domain-forwarding-card__fields" key={ `view-${ child.record }` }>
			<div className="domain-forwarding-card__fields-row">
				<div className="domain-forwarding-card__fields-column">
					<Badge type="info">{ translate( 'Glue record' ) }</Badge>
				</div>
				<div className="domain-forwarding-card__fields-column">
					<Button
						borderless
						className="edit-redirect-button link-button"
						onClick={ () => handleDelete( child.record ) }
					>
						{ translate( 'Remove' ) }
					</Button>
				</div>
			</div>

			<div className="domain-forwarding-card__fields-row addresses">
				<div className="domain-forwarding-card__fields-column source">
					{ translate( 'Record' ) }:
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
		</FormFieldset>
	);

	const FormRowEditable = ( { child }: { child: GlueRecordObject } ) => (
		<>
			<FormFieldset className="domain-forwarding-card__fields" key={ `edit-${ child.record }` }>
				<FormLabel>{ translate( 'Record' ) }</FormLabel>
				<div className="glue-record-input-wrapper">
					<FormTextInputWithAffixes
						placeholder="ns1"
						disabled={ isLoading }
						name="record"
						onChange={ handleRecordChange }
						value={ record }
						// className={ classNames( { 'is-error': ! isValidUrl } ) }
						maxLength={ 1000 }
						suffix={ <FormLabel>.{ domain.domain }</FormLabel> }
					/>
				</div>
				<FormLabel>{ translate( 'IP Address' ) }</FormLabel>
				<div className="ip-address">
					<FormTextInputWithAffixes
						disabled={ isLoading }
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
				{ /*// TODO: validate glue record*/ }
				{ /*{ ! isValidUrl && (
					<div className="domain-forwarding-card__error-field">
						<FormInputValidation isError={ true } text={ errorMessage } />
					</div>
				) }*/ }

				<div>
					<FormButton onClick={ handleSubmit } disabled={ isLoading }>
						{ translate( 'Save' ) }
					</FormButton>
					<FormButton onClick={ () => clearState() } type="button" isPrimary={ false }>
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
