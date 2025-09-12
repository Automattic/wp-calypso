import {
	twoStepAuthApplicationPasswordsQuery,
	deleteTwoStepAuthApplicationPasswordMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardHeader,
	CardBody,
	Icon,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import InlineSupportLink from '../../../../components/inline-support-link';
import { SectionHeader } from '../../../../components/section-header';
import RegisterApplicationPassword from './register-application-password';
import type { TwoStepAuthApplicationPassword } from '@automattic/api-core';

const fields = [
	{
		id: 'name',
		label: __( 'Name' ),
		getValue: ( { item }: { item: TwoStepAuthApplicationPassword } ) => item.name,
	},
];

const view = {
	fields: [],
	type: 'list' as const,
	titleField: 'name',
};

const ApplicationPasswordsList = ( {
	data,
	isLoading,
}: {
	data: TwoStepAuthApplicationPassword[];
	isLoading: boolean;
} ) => {
	const { mutate: deleteApplicationPassword } = useMutation(
		deleteTwoStepAuthApplicationPasswordMutation()
	);

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ selectedKeyToRemove, setSelectedKeyToRemove ] =
		useState< TwoStepAuthApplicationPassword | null >( null );

	const handleRemove = () => {
		const selectedApplicationPassword = selectedKeyToRemove;
		setSelectedKeyToRemove( null );

		if ( selectedApplicationPassword ) {
			deleteApplicationPassword( selectedApplicationPassword.ID, {
				onSuccess: () => {
					createSuccessNotice(
						/* translators: %s is the application name */
						sprintf( __( 'Application password "%s" removed.' ), selectedApplicationPassword.name ),
						{
							type: 'snackbar',
						}
					);
				},
				onError: () => {
					createErrorNotice( __( 'Failed to remove application password.' ), {
						type: 'snackbar',
					} );
				},
			} );
		}
	};

	return (
		<>
			<DataViews< TwoStepAuthApplicationPassword >
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ () => {} }
				getItemId={ ( item ) => item.ID }
				paginationInfo={ { totalItems: data.length, totalPages: 1 } }
				defaultLayouts={ { list: {} } }
				empty={ __( 'No application passwords added.' ) }
				isLoading={ isLoading }
				actions={ [
					{
						id: 'remove',
						label: __( 'Remove' ),
						icon: <Icon icon={ closeSmall } />,
						isPrimary: true,
						callback: ( items: TwoStepAuthApplicationPassword[] ) => {
							const item = items[ 0 ];
							setSelectedKeyToRemove( item );
						},
					},
				] }
			>
				<DataViews.Layout />
			</DataViews>
			<ConfirmDialog
				isOpen={ !! selectedKeyToRemove }
				confirmButtonText={ __( 'Remove application password' ) }
				onCancel={ () => setSelectedKeyToRemove( null ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this application password?' ) }
			</ConfirmDialog>
		</>
	);
};

export default function ApplicationPasswords() {
	const [ isAddApplicationPasswordModalOpen, setIsAddApplicationPasswordModalOpen ] =
		useState( false );

	const { data: applicationPasswords, isLoading } = useQuery(
		twoStepAuthApplicationPasswordsQuery()
	);

	return (
		<>
			<SectionHeader
				level={ 2 }
				title={ __( 'Application passwords' ) }
				description={ createInterpolateElement(
					__(
						'Generate a custom password for each third-party application you authorise to use your WordPress.com account. You can revoke access for an individual application here if you ever need to. <learnMoreLink>Learn more</learnMoreLink>'
					),
					{
						learnMoreLink: (
							<InlineSupportLink
								supportPostId={ 263616 }
								supportLink={ localizeUrl(
									'https://wordpress.com/support/security/two-step-authentication/application-specific-passwords'
								) }
							/>
						),
					}
				) }
			/>
			<Card>
				<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Your application passwords' ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => setIsAddApplicationPasswordModalOpen( true ) }
							>
								{ __( 'Add application password' ) }
							</Button>
						}
					/>
				</CardHeader>
				<CardBody>
					<ApplicationPasswordsList data={ applicationPasswords ?? [] } isLoading={ isLoading } />
				</CardBody>
			</Card>
			{ isAddApplicationPasswordModalOpen && (
				<RegisterApplicationPassword
					onClose={ () => setIsAddApplicationPasswordModalOpen( false ) }
				/>
			) }
		</>
	);
}
