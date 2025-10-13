import {
	twoStepAuthApplicationPasswordsQuery,
	deleteTwoStepAuthApplicationPasswordMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, CardHeader, CardBody, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { useLocale } from '../../../../app/locale';
import ConfirmModal from '../../../../components/confirm-modal';
import InlineSupportLink from '../../../../components/inline-support-link';
import { SectionHeader } from '../../../../components/section-header';
import RegisterApplicationPassword from './register-application-password';
import type { TwoStepAuthApplicationPassword } from '@automattic/api-core';

const fields = ( locale: string ) => [
	{
		id: 'name',
		label: __( 'Name' ),
		getValue: ( { item }: { item: TwoStepAuthApplicationPassword } ) => item.name,
	},
	{
		id: 'generated',
		label: __( 'Generated' ),
		getValue: ( { item }: { item: TwoStepAuthApplicationPassword } ) => {
			const date = new Date( item.generated );
			const formattedDate =
				date.toLocaleDateString( locale, {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				} ) +
				' ' +
				date.toLocaleTimeString( locale, {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				} );
			return sprintf(
				/* translators: %s is the date of the generated password */
				__( 'Generated on %s' ),
				formattedDate
			);
		},
	},
];

const view = {
	fields: [ 'generated' ],
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
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();

	const { mutate: deleteApplicationPassword, isPending: isDeletingApplicationPassword } =
		useMutation( deleteTwoStepAuthApplicationPasswordMutation() );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ selectedKeyToRemove, setSelectedKeyToRemove ] =
		useState< TwoStepAuthApplicationPassword | null >( null );

	const handleRemove = () => {
		if ( selectedKeyToRemove ) {
			recordTracksEvent( 'calypso_dashboard_security_application_passwords_remove_password_click' );
			deleteApplicationPassword( selectedKeyToRemove.ID, {
				onSuccess: () => {
					createSuccessNotice(
						/* translators: %s is the application name */
						sprintf( __( 'Application password "%s" removed.' ), selectedKeyToRemove.name ),
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
				onSettled: () => {
					setSelectedKeyToRemove( null );
				},
			} );
		}
	};

	return (
		<>
			<DataViews< TwoStepAuthApplicationPassword >
				data={ data }
				fields={ fields( locale ) }
				view={ view }
				onChangeView={ () => {} }
				getItemId={ ( item ) => item.ID }
				paginationInfo={ { totalItems: data.length, totalPages: 1 } }
				defaultLayouts={ { list: {} } }
				empty={ <p>{ __( 'No application passwords added.' ) }</p> }
				isLoading={ isLoading }
				actions={ [
					{
						id: 'remove',
						label: __( 'Remove' ),
						icon: <Icon icon={ closeSmall } />,
						isPrimary: true,
						callback: ( items: TwoStepAuthApplicationPassword[] ) => {
							const item = items[ 0 ];
							recordTracksEvent(
								'calypso_dashboard_security_application_passwords_remove_password_dialog_open'
							);
							setSelectedKeyToRemove( item );
						},
					},
				] }
			>
				<DataViews.Layout />
			</DataViews>
			<ConfirmModal
				isOpen={ !! selectedKeyToRemove }
				confirmButtonProps={ {
					label: __( 'Remove application password' ),
					isBusy: isDeletingApplicationPassword,
					disabled: isDeletingApplicationPassword,
				} }
				onCancel={ () => setSelectedKeyToRemove( null ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this application password?' ) }
			</ConfirmModal>
		</>
	);
};

export default function ApplicationPasswords() {
	const { recordTracksEvent } = useAnalytics();

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
						'Generate a custom password for each third-party application you authorize to use your WordPress.com account. You can revoke access for an individual application here if you ever need to. <learnMoreLink>Learn more</learnMoreLink>'
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
								onClick={ () => {
									setIsAddApplicationPasswordModalOpen( true );
									recordTracksEvent(
										'calypso_dashboard_security_application_passwords_add_password_modal_open'
									);
								} }
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
