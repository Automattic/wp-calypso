import { createSshKeyMutation, updateSshKeyMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	TextareaControl,
	BaseControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import { isSshKeyValid } from '../../utils/ssh';
import type { UserSshKey } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type SshKeyFormData = {
	key: string;
};

export default function SshKeyForm( {
	sshKey,
	isEditing,
	setIsEditing,
	username,
}: {
	sshKey?: UserSshKey;
	isEditing?: boolean;
	setIsEditing?: ( isEditing: boolean ) => void;
	username: string;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const { createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< SshKeyFormData >( {
		key: '',
	} );

	const { mutate: createSshKey, isPending: isCreatingSshKey } = useMutation( {
		...createSshKeyMutation(),
		meta: {
			snackbar: {
				success: __( 'SSH key saved.' ),
				error: __( 'Failed to save SSH key.' ),
			},
		},
	} );
	const { mutate: updateSshKey, isPending: isUpdatingSshKey } = useMutation( {
		...updateSshKeyMutation(),
		meta: {
			snackbar: {
				success: __( 'SSH key saved.' ),
				error: __( 'Failed to save SSH key.' ),
			},
		},
	} );

	const handleUpdateSshKey = () => {
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_update_click' );
		updateSshKey( formData.key );
	};

	const handleCreateSshKey = () => {
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_create_click' );
		createSshKey( { key: formData.key, name: 'default' } );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		const isValid = isSshKeyValid( formData.key );
		if ( ! isValid ) {
			createErrorNotice(
				__(
					'Invalid SSH public key. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, or ecdsa-sha2-nistp521.'
				),
				{
					type: 'snackbar',
				}
			);
			return;
		}
		if ( isEditing ) {
			handleUpdateSshKey();
		} else {
			handleCreateSshKey();
		}
	};

	const fields: Field< SshKeyFormData >[] = useMemo(
		() => [
			{
				id: 'key',
				label: isEditing ? __( 'New Public ssh key' ) : __( 'Public ssh key' ),
				description: __(
					'Paste your SSH public key here. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384 or ecdsa-sha2-nistp521…'
				),
				type: 'text',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<TextareaControl
							__nextHasNoMarginBottom
							label={ field.label }
							help={ field.description }
							placeholder={ field.placeholder }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
							disabled={ isCreatingSshKey || isUpdatingSshKey }
						/>
					);
				},
				// TODO: Add validation via isValid.custom.
				// There is currently a bug that prevents it from working.
				// For now, we're using the handleSubmit to validate the SSH key.
			},
		],
		[ isCreatingSshKey, isUpdatingSshKey, isEditing ]
	);

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ ! isEditing && (
							<SectionHeader
								title={ __( 'Add SSH key' ) }
								level={ 3 }
								description={ createInterpolateElement(
									__(
										'Once added, attach the SSH key to a site with a Business or Commerce plan to enable SSH key authentication for that site. <learnMoreLink>Learn more</learnMoreLink>'
									),
									{
										learnMoreLink: (
											<InlineSupportLink
												supportPostId={ 100385 }
												supportLink={ localizeUrl(
													'https://developer.wordpress.com/docs/developer-tools/ssh/'
												) }
											/>
										),
									}
								) }
							/>
						) }
						{ isEditing && sshKey && (
							<BaseControl label={ __( 'Current public SSH key' ) }>
								<Card isRounded={ false }>
									<CardBody>
										<VStack spacing={ 2 }>
											<Text weight={ 500 } lineHeight="20px">
												{ username }-{ sshKey.name }
											</Text>
											<Text variant="muted" lineHeight="20px" size="13px">
												{ sshKey.sha256 }
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</BaseControl>
						) }
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< SshKeyFormData >
									data={ formData }
									fields={ fields }
									form={ { layout: { type: 'regular' as const }, fields } }
									onChange={ ( edits: Partial< SshKeyFormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<ButtonStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isCreatingSshKey || isUpdatingSshKey }
										disabled={ isCreatingSshKey || isUpdatingSshKey || ! formData.key }
									>
										{ __( 'Save' ) }
									</Button>
									{ isEditing && (
										<Button variant="tertiary" onClick={ () => setIsEditing?.( false ) }>
											{ __( 'Cancel' ) }
										</Button>
									) }
								</ButtonStack>
							</VStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
