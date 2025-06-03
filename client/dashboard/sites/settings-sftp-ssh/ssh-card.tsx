import { CoreBadge } from '@automattic/components';
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
import ClipboardInputControl from './clipboard-input-control';
import type { SftpUser, SiteSshKey, ProfileSshKey } from '../../data/types';

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
		<Card>
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
	const [ selectedSshKey, setSelectedSshKey ] = useState( 'default' );
	const { user } = useAuth();
	const { data: siteSshKeys } = useQuery( siteSshKeysQuery( siteSlug ) );
	const { data: profileSshKeys } = useQuery( profileSshKeysQuery() );
	const toggleSshAccessMutation = useMutation(
		! sshEnabled
			? siteSshAccessEnableMutation( siteSlug )
			: siteSshAccessDisableMutation( siteSlug )
	);
	const attachSshKeyMutation = useMutation( siteSshKeysAttachMutation( siteSlug ) );
	const detachSshKeyMutation = useMutation( siteSshKeysDetachMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const userLocale = user.locale_variant || user.language || 'en';
	const { username } = sftpUsers[ 0 ];

	const userKeyIsAttached = useMemo( () => {
		if ( ! siteSshKeys ) {
			return false;
		}
		return !! siteSshKeys.find( ( { user_login }: SiteSshKey ) => user_login === user.username );
	}, [ siteSshKeys, user.username ] );

	const showSshKeysSelect = ! userKeyIsAttached && profileSshKeys && profileSshKeys.length > 0;

	const handleCopy = ( label: string ) => {
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
		attachSshKeyMutation.mutate( selectedSshKey, {
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

	const handleSelectedSshKeyChange = ( currentSelectedKey: string ) => {
		setSelectedSshKey( currentSelectedKey );
	};

	return (
		<Card>
			<CardBody>
				<VStack style={ { paddingBottom: '12px' } }>
					<Text size="15px" weight={ 500 } lineHeight="32px">
						{ __( 'SSH' ) }
					</Text>
					<Text variant="muted" as="p">
						{ createInterpolateElement(
							__(
								"SSH lets you access your site's backend via a terminal, so you can manage files and use <wpCliLink>WP-CLI</wpCliLink> for quick changes and troubleshooting. <learnMoreLink>Learn more</learnMoreLink>."
							),
							{
								wpCliLink: <ExternalLink href="#" children={ null } />,
								learnMoreLink: <ExternalLink href="#hosting-connect-to-ssh" children={ null } />,
							}
						) }
					</Text>
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
						<>
							<ClipboardInputControl
								label={ __( 'Connection command' ) }
								value={ `ssh ${ username }@ssh.wp.com` }
								readOnly
								__next40pxDefaultSize
								onCopy={ handleCopy }
							/>

							{ siteSshKeys && siteSshKeys.length > 0 && (
								<BaseControl label={ __( 'SSH Key' ) } __nextHasNoMarginBottom>
									<VStack>
										{ siteSshKeys.map( ( siteSshKey: SiteSshKey ) => (
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
							) }
							{ /* TODO: Use DataForm and add ReauthRequired */ }
							{ showSshKeysSelect && (
								<SelectControl
									label={ __( 'SSH key' ) }
									value={ selectedSshKey }
									options={ profileSshKeys.map( ( profileSshKey: ProfileSshKey ) => ( {
										label: `${ user.username }-${ profileSshKey.name }`,
										value: profileSshKey.name,
									} ) ) }
									onChange={ handleSelectedSshKeyChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							) }
						</>
					) }
				</VStack>
				{ showSshKeysSelect && (
					<HStack justify="flex-start" style={ { padding: '8px 0' } }>
						<Button
							variant="primary"
							isBusy={ attachSshKeyMutation.isPending }
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
