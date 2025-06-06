import { CoreBadge } from '@automattic/components';
import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	BaseControl,
	Button,
	Card,
	CardBody,
	ExternalLink,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/auth';
import {
	siteSshAccessEnableMutation,
	siteSshAccessDisableMutation,
	siteSshKeysQuery,
	siteSshKeysAttachMutation,
	siteSshKeysDetachMutation,
	profileSshKeysQuery,
} from '../../app/queries';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { SectionHeader } from '../../components/section-header';
import type { SftpUser, SiteSshKey, ProfileSshKey } from '../../data/types';
import type { DataFormControlProps, Field } from '@automattic/dataviews';

type SshCardFormData = {
	connection_command: string;
	ssh_key: string;
};

const SshKeyCard = ( {
	siteSshKey,
	userLocale,
	isBusy,
	onDetach,
}: {
	siteSshKey: SiteSshKey;
	userLocale: string;
	isBusy: boolean;
	onDetach: ( siteSshKey: SiteSshKey ) => void;
} ) => {
	return (
		<Card size="small">
			<CardBody>
				<HStack spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 3 } alignment="flex-start">
						<VStack spacing={ 1 }>
							<Text>{ `${ siteSshKey.user_login }-${ siteSshKey.name }` }</Text>
							<Text variant="muted">{ siteSshKey.sha256 }</Text>
						</VStack>
						<CoreBadge intent="info" style={ { height: '24px' } }>
							{ sprintf(
								/* translators: %s is when the SSH key was attached. */
								__( 'Attached on %s' ),
								new Intl.DateTimeFormat( userLocale, {
									dateStyle: 'long',
									timeStyle: 'medium',
								} ).format( new Date( siteSshKey.attached_at ) )
							) }
						</CoreBadge>
					</VStack>
					<Button
						icon={ trash }
						label={ __( 'Detach' ) }
						isBusy={ isBusy }
						style={ { margin: '-6px' } }
						onClick={ () => onDetach( siteSshKey ) }
					/>
				</HStack>
			</CardBody>
		</Card>
	);
};

export default function SshCard( {
	siteSlug,
	sftpUsers,
	sshEnabled,
}: {
	siteSlug: string;
	sftpUsers: SftpUser[];
	sshEnabled: boolean;
} ) {
	const { user } = useAuth();
	const { data: siteSshKeys } = useQuery( siteSshKeysQuery( siteSlug ) );
	const { data: profileSshKeys, error: profileSshKeysError } = useQuery<
		ProfileSshKey[],
		{ code: string }
	>( {
		...profileSshKeysQuery(),
		enabled: sshEnabled,
	} );
	const toggleSshAccessMutation = useMutation(
		! sshEnabled
			? siteSshAccessEnableMutation( siteSlug )
			: siteSshAccessDisableMutation( siteSlug )
	);
	const attachSshKeyMutation = useMutation( siteSshKeysAttachMutation( siteSlug ) );
	const detachSshKeyMutation = useMutation( siteSshKeysDetachMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const userLocale = user.locale_variant || user.language || 'en';
	const hasProfileSshKeys = profileSshKeys && profileSshKeys.length > 0;
	const [ formData, setFormData ] = useState< SshCardFormData >( {
		connection_command: `ssh ${ sftpUsers[ 0 ]?.username }@ssh.wp.com`,
		ssh_key: 'default',
	} );

	const userKeyIsAttached = useMemo( () => {
		if ( ! siteSshKeys ) {
			return false;
		}
		return !! siteSshKeys.find( ( { user_login }: SiteSshKey ) => user_login === user.username );
	}, [ siteSshKeys, user.username ] );

	const handleCopy = ( label?: React.ReactNode ) => {
		if ( ! label ) {
			return;
		}

		createSuccessNotice(
			sprintf(
				/* translators: %s is the copied field */
				__( 'Copied %s to clipboard.' ),
				label
			),
			{
				type: 'snackbar',
			}
		);
	};

	const handleToggleSshAccess = () => {
		toggleSshAccessMutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					sshEnabled
						? __( 'SSH access has been successfully disabled for this site.' )
						: __( 'SSH access has been successfully enabled for this site.' ),
					{
						type: 'snackbar',
					}
				);
			},
			onError: () => {
				createErrorNotice(
					sshEnabled
						? __(
								'Sorry, we had a problem disabling SSH access for this site. Please refresh the page and try again.'
						  )
						: __(
								'Sorry, we had a problem enabling SSH access for this site. Please refresh the page and try again.'
						  ),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	const handleAttachSshKey = () => {
		attachSshKeyMutation.mutate( formData.ssh_key, {
			onError: () => {
				createErrorNotice(
					__(
						'Sorry, we had a problem attaching SSH key to this site. Please refresh the page and try again.'
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	const handleDetachSshKey = ( siteSshKey: SiteSshKey ) => {
		detachSshKeyMutation.mutate( siteSshKey, {
			onError: () => {
				createErrorNotice(
					__(
						'Sorry, we had a problem detaching SSH key from this site. Please refresh the page and try again.'
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	const SshKeysControl = < Item, >( { field }: DataFormControlProps< Item > ) => (
		<BaseControl label={ field.label } __nextHasNoMarginBottom>
			<VStack>
				{ siteSshKeys?.map( ( siteSshKey: SiteSshKey ) => (
					<SshKeyCard
						key={ siteSshKey.sha256 }
						siteSshKey={ siteSshKey }
						userLocale={ userLocale }
						isBusy={ detachSshKeyMutation.isPending }
						onDetach={ handleDetachSshKey }
					/>
				) ) }
			</VStack>
		</BaseControl>
	);

	const fields: Field< SshCardFormData >[] = [
		{
			id: 'connection_command',
			label: __( 'connection command' ),
			Edit: ( { field, data } ) => {
				return (
					<ClipboardInputControl
						label={ field.label }
						value={ field.getValue( { item: data } ) }
						readOnly
						__next40pxDefaultSize
						onCopy={ handleCopy }
					/>
				);
			},
		},
		{
			id: 'ssh_key',
			label: __( 'SSH key' ),
			Edit: ( { data, field, onChange, hideLabelFromVision } ) => {
				if ( siteSshKeys && siteSshKeys.length > 0 ) {
					return (
						<SshKeysControl
							data={ data }
							field={ field }
							onChange={ onChange }
							hideLabelFromVision={ hideLabelFromVision }
						/>
					);
				}

				return (
					<SelectControl
						label={ field.label }
						value={ field.getValue( { item: data } ) ?? '' }
						help={ field.description }
						options={ field.elements }
						disabled={ ! hasProfileSshKeys }
						onChange={ ( newValue: any ) =>
							onChange( {
								[ field.id ]: newValue,
							} )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						hideLabelFromVision={ hideLabelFromVision }
					/>
				);
			},
			elements: hasProfileSshKeys
				? profileSshKeys.map( ( profileSshKey: ProfileSshKey ) => ( {
						label: `${ user.username }-${ profileSshKey.name }`,
						value: profileSshKey.name,
				  } ) )
				: [
						{
							label: __( 'No SSH keys available' ),
							value: '',
						},
				  ],
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ 'connection_command', 'ssh_key' ],
	};

	if ( profileSshKeysError?.code === 'reauthorization_required' ) {
		const currentPath = window.location.pathname;
		const loginUrl = `/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
		window.location.href = loginUrl;
		return null;
	}

	return (
		<Card>
			<CardBody>
				<VStack style={ { paddingBottom: '12px' } }>
					<SectionHeader
						title={ __( 'SSH' ) }
						description={ createInterpolateElement(
							__(
								"SSH lets you access your site's backend via a terminal, so you can manage files and use <wpCliLink>WP-CLI</wpCliLink> for quick changes and troubleshooting. <learnMoreLink>Learn more</learnMoreLink>."
							),
							{
								wpCliLink: <ExternalLink href="#" children={ null } />,
								learnMoreLink: <ExternalLink href="#hosting-connect-to-ssh" children={ null } />,
							}
						) }
						level={ 3 }
					/>
				</VStack>
				<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
					<ToggleControl
						label={ __( 'Enable SSH access for this site' ) }
						checked={ sshEnabled }
						disabled={ toggleSshAccessMutation.isPending }
						onChange={ handleToggleSshAccess }
						__nextHasNoMarginBottom
					/>
					{ sshEnabled && (
						<DataForm< SshCardFormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< SshCardFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
					) }
				</VStack>
				{ sshEnabled && ! userKeyIsAttached && (
					<HStack justify="flex-start" style={ { padding: '8px 0' } }>
						<Button
							variant="primary"
							isBusy={ attachSshKeyMutation.isPending }
							disabled={ ! hasProfileSshKeys }
							onClick={ handleAttachSshKey }
						>
							{ __( 'Attach SSH key to site' ) }
						</Button>
						<Button
							variant="secondary"
							target="_blank"
							href="/me/security/ssh-key"
							rel="noreferrer"
						>
							{ __( 'Add new SSH key ↗' ) }
						</Button>
					</HStack>
				) }
			</CardBody>
		</Card>
	);
}
