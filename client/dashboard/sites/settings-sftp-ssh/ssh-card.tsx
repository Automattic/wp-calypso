import { CoreBadge } from '@automattic/components';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
	SelectControl,
	Text,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
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
import type { SftpUser, SiteSshKey, ProfileSshKey } from '../../data/types';

export default function SshCard( {
	siteSlug,
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
	const userLocale = user.locale_variant || user.language || 'en';
	const { username } = sftpUsers[ 0 ];

	const userKeyIsAttached = useMemo( () => {
		if ( ! siteSshKeys ) {
			return false;
		}
		return !! siteSshKeys.find( ( { user_login }: SiteSshKey ) => user_login === username );
	}, [ siteSshKeys, username ] );

	const showSshKeysSelect = ! userKeyIsAttached && profileSshKeys && profileSshKeys.length > 0;

	const handleToggleSshAccess = () => {
		toggleSshAccessMutation.mutate();
	};

	const handleAttachSshKey = () => {
		attachSshKeyMutation.mutate( selectedSshKey );
	};

	const handleDetachSshKey = ( siteSshKey: SiteSshKey ) => {
		detachSshKeyMutation.mutate( siteSshKey.user_login, siteSshKey.name );
	};

	const handleSelectedSshKeyChange = ( currentSelectedKey: string ) => {
		setSelectedSshKey( currentSelectedKey );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack>
						<Text>{ __( 'SSH' ) }</Text>
						<Text as="p">
							{ createInterpolateElement(
								__(
									"SSH lets you access your site's backend via a terminal, so you can manage files and use <wpCliLink>WP-CLI</wpCliLink> for quick changes and troubleshooting. <learnMoreLink>Learn more</learnMoreLink>."
								),
								{
									// @ts-expect-error children prop is injected by createInterpolateElement
									wpCliLink: <ExternalLink href="#" />,
									learnMoreLink: <ExternalLink href="#hosting-connect-to-ssh" />,
								}
							) }
						</Text>
					</VStack>
					<VStack spacing={ 4 }>
						<ToggleControl
							label={ __( 'Enable SSH access for this site' ) }
							checked={ sshEnabled }
							disabled={ mutation.isPending }
							onChange={ handleToggleSshAccess }
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Connection command' ) }
							value={ `ssh ${ username }@ssh.wp.com` }
							readonly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						{ siteSshKeys &&
							siteSshKeys.map( ( siteSshKey: SiteSshKey ) => (
								<>
									<Text>{ __( 'SSH Key' ) }</Text>
									<Card key={ siteSshKey.sha256 }>
										<CardBody>
											<HStack spacing={ 4 } justify="space-between" alignment="flex-start">
												<VStack spacing={ 3 }>
													<VStack spacing={ 1 }>
														<Text>{ `${ siteSshKey.user_login }-${ siteSshKey.name }` }</Text>
														<Text variant="muted">{ siteSshKey.sha256 }</Text>
													</VStack>
													<CoreBadge
														intent="info"
														text={ sprintf(
															/* translators: %s is when the SSH key was attached. */
															__( 'Attached on %s' ),
															new Intl.DateTimeFormat( userLocale, {
																dateStyle: 'long',
																timeStyle: 'medium',
															} ).format( new Date( siteSshKey.attached_at ) )
														) }
													/>
												</VStack>
												<Button icon={ trash } onClick={ () => handleDetachSshKey( siteSshKey ) } />
											</HStack>
										</CardBody>
									</Card>
								</>
							) ) }
						{ /* TODO: Use DataForm and add ReauthRequired */ }
						{ showSshKeysSelect && (
							<>
								<SelectControl
									label={ __( 'SSH key' ) }
									value={ selectedSshKey }
									options={ profileSshKeys.map( ( profileSshKey: ProfileSshKey ) => ( {
										label: profileSshKey.name,
										value: profileSshKey.name,
									} ) ) }
									onChange={ handleSelectedSshKeyChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>

								<HStack justify="flex-start">
									<Button variant="primary" onClick={ handleAttachSshKey }>
										{ __( 'Attach SSH key to site' ) }
									</Button>
									<Button variant="secondary" href="/me/security/ssh-key">
										{ __( 'Add new SSH key ↗️' ) }
									</Button>
								</HStack>
							</>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
