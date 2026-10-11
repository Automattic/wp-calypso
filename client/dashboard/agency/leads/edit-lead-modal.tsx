/**
 * PROTOTYPE — proof of concept only.
 *
 * "Edit lead details" modal: the lead as it came in, then a form where the
 * agency moves it along (in progress, closed won, closed lost) and reports
 * the actual value, time to close, and why a lead was lost. Same Modal +
 * DataForm pattern as the team invite modal.
 */
import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';
import {
	getLeadSourceLabels,
	getLeadStatusLabels,
	getLostReasonLabels,
	saveLeadEdits,
} from './lead-data';
import type { Lead, LeadEdits, LeadStatus, LostReason } from './lead-data';
import type { Field, Form } from '@wordpress/dataviews';

const money = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

const isClosed = ( item: LeadEdits ) => item.status === 'won' || item.status === 'lost';

function getFields( lead: Lead ): Field< LeadEdits >[] {
	const statusLabels = getLeadStatusLabels();
	const lostReasonLabels = getLostReasonLabels();

	return [
		{
			id: 'status',
			type: 'text',
			Edit: 'select',
			label: __( 'Status' ),
			elements: ( Object.keys( statusLabels ) as LeadStatus[] ).map( ( value ) => ( {
				value,
				label: statusLabels[ value ],
			} ) ),
		},
		{
			id: 'actualValue',
			type: 'integer',
			label: __( 'Actual value (USD)' ),
			description: sprintf(
				/* translators: %s is the value estimated when the lead came in, e.g. $9,500 */
				__( 'Reported when the lead came in: %s. Enter what the project came to.' ),
				money( lead.reportedValue )
			),
			isVisible: ( item ) => item.status === 'won',
			isValid: {
				custom: ( item ) =>
					item.status === 'won' && ( item.actualValue === undefined || item.actualValue < 0 )
						? __( 'Enter the project’s actual value.' )
						: null,
			},
		},
		{
			id: 'daysToClose',
			type: 'integer',
			label: __( 'Time to close (days)' ),
			description: __( 'From first contact to a signed project or a final no.' ),
			isVisible: isClosed,
			isValid: {
				custom: ( item ) =>
					isClosed( item ) && item.daysToClose !== undefined && item.daysToClose < 0
						? __( 'Enter a number of days.' )
						: null,
			},
		},
		{
			id: 'lostReason',
			type: 'text',
			Edit: 'select',
			label: __( 'Why was it lost?' ),
			elements: [
				{ value: '', label: __( 'Choose a reason' ) },
				...( Object.keys( lostReasonLabels ) as LostReason[] ).map( ( value ) => ( {
					value,
					label: lostReasonLabels[ value ],
				} ) ),
			],
			isVisible: ( item ) => item.status === 'lost',
		},
		{
			id: 'notes',
			type: 'text',
			Edit: 'textarea',
			label: __( 'Notes' ),
			description: __( 'Optional. Anything that helps us send you better-matched leads.' ),
		},
	];
}

const form: Form = {
	layout: { type: 'regular' },
	fields: [ 'status', 'actualValue', 'daysToClose', 'lostReason', 'notes' ],
};

// Label and value pairs for the lead as it came in.
function Detail( { label, value }: { label: string; value: string } ) {
	return (
		<VStack spacing={ 0 }>
			<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
				{ label }
			</Text>
			<Text lineHeight="20px">{ value }</Text>
		</VStack>
	);
}

export default function EditLeadModal( { lead, onClose }: { lead: Lead; onClose: () => void } ) {
	const locale = useLocale();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState< LeadEdits >( {
		status: lead.status,
		// A won lead starts from the reported value, so the agency only edits what changed.
		actualValue: lead.actualValue ?? lead.reportedValue,
		daysToClose: lead.daysToClose,
		lostReason: lead.lostReason,
		notes: lead.notes ?? '',
	} );
	const fields = getFields( lead );
	const { validity, isValid } = useFormValidity( formData, fields, form );

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! isValid ) {
			return;
		}
		// Only keep the fields that apply to the chosen status.
		saveLeadEdits( lead.id, {
			status: formData.status,
			actualValue: formData.status === 'won' ? formData.actualValue : undefined,
			daysToClose: isClosed( formData ) ? formData.daysToClose : undefined,
			lostReason: formData.status === 'lost' ? formData.lostReason || undefined : undefined,
			notes: formData.notes?.trim() || undefined,
		} );
		createSuccessNotice(
			sprintf(
				/* translators: %s is the client's name */
				__( '%s updated.' ),
				lead.client
			),
			{ type: 'snackbar' }
		);
		onClose();
	};

	return (
		<Modal title={ lead.client } onRequestClose={ onClose } size="medium">
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 6 }>
					<VStack spacing={ 4 }>
						<Text lineHeight="20px">{ lead.project }</Text>
						<HStack spacing={ 6 } justify="flex-start" alignment="flex-start" wrap>
							<Detail label={ __( 'Contact' ) } value={ lead.contactName } />
							<Detail
								label={ __( 'Source' ) }
								value={ `${ getLeadSourceLabels()[ lead.source ] } · ${ lead.sourceDetail }` }
							/>
							<Detail
								label={ __( 'Received' ) }
								value={ formatDate( new Date( lead.receivedAt ), locale ) }
							/>
							<Detail label={ __( 'Reported value' ) } value={ money( lead.reportedValue ) } />
						</HStack>
					</VStack>
					<DataForm< LeadEdits >
						data={ formData }
						fields={ fields }
						form={ form }
						validity={ validity }
						onChange={ ( edits: Partial< LeadEdits > ) =>
							setFormData( ( data ) => ( { ...data, ...edits } ) )
						}
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" __next40pxDefaultSize onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button variant="primary" type="submit" __next40pxDefaultSize disabled={ ! isValid }>
							{ __( 'Save' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
