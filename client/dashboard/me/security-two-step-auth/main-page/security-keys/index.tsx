import { securityKeysQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardHeader,
	CardBody,
	Icon,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useState } from 'react';
import InlineSupportLink from '../../../../components/inline-support-link';
import { SectionHeader } from '../../../../components/section-header';
import { isWebAuthnSupported } from '../../hooks/use-register-security-key';
import RegisterKey from './register-key';
import type { UserSecurityKeys } from '@automattic/api-core';

type SecurityKeyRegistration = UserSecurityKeys[ 'registrations' ][ number ];

const fields = [
	{
		id: 'name',
		label: __( 'Name' ),
		getValue: ( { item }: { item: SecurityKeyRegistration } ) => item.name,
	},
];

const view = {
	fields: [],
	type: 'list' as const,
	titleField: 'name',
};

const SecurityKeysList = ( {
	data,
	isLoading,
}: {
	data: SecurityKeyRegistration[];
	isLoading: boolean;
} ) => {
	const [ selectedKeyToRemove, setSelectedKeyToRemove ] =
		useState< SecurityKeyRegistration | null >( null );

	const handleRemove = () => {
		setSelectedKeyToRemove( null );
		// TODO: Remove the key
	};

	return (
		<>
			<DataViews< SecurityKeyRegistration >
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ () => {} }
				getItemId={ ( item ) => item.id }
				paginationInfo={ { totalItems: data.length, totalPages: 1 } }
				defaultLayouts={ { list: {} } }
				empty={ __( 'No security keys registered' ) }
				isLoading={ isLoading }
				actions={ [
					{
						id: 'remove',
						label: __( 'Remove' ),
						icon: <Icon icon={ closeSmall } />,
						isPrimary: true,
						callback: ( items: SecurityKeyRegistration[] ) => {
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
				confirmButtonText={ __( 'Remove security key' ) }
				onCancel={ () => setSelectedKeyToRemove( null ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this security key?' ) }
			</ConfirmDialog>
		</>
	);
};

export default function SecurityKeys() {
	const [ isAddKeyModalOpen, setIsAddKeyModalOpen ] = useState( false );

	const { data: securityKeys, isLoading, refetch } = useQuery( securityKeysQuery() );

	const registrations = securityKeys?.registrations ?? [];

	const isBrowserSupported = isWebAuthnSupported();

	return (
		<>
			<SectionHeader
				level={ 2 }
				title={ __( 'Security keys' ) }
				description={
					isBrowserSupported
						? createInterpolateElement(
								__(
									'Security keys offer a more robust form of two-step authentication. your security key may be a physical device, or you can use passkey support built into your browser. <learnMoreLink>Learn more</learnMoreLink>'
								),
								{
									learnMoreLink: (
										<InlineSupportLink supportContext="two-step-authentication-security-key">
											{ __( 'Learn more' ) }
										</InlineSupportLink>
									),
								}
						  )
						: __(
								"Your browser doesn't support the FIDO2 security key standard yet. To use a second factor security key to sign in please try a supported browser like Chrome, Safari, or Firefox."
						  )
				}
			/>
			{ isBrowserSupported && (
				<>
					<Card>
						<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Your security keys' ) }
								actions={
									<Button
										variant="secondary"
										size="compact"
										onClick={ () => setIsAddKeyModalOpen( true ) }
									>
										{ __( 'Register key' ) }
									</Button>
								}
							/>
						</CardHeader>
						<CardBody>
							<SecurityKeysList data={ registrations } isLoading={ isLoading } />
						</CardBody>
					</Card>
					{ isAddKeyModalOpen && (
						<RegisterKey onClose={ () => setIsAddKeyModalOpen( false ) } refetch={ refetch } />
					) }
				</>
			) }
		</>
	);
}
