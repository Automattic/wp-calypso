import { CoreBadge } from '@automattic/components';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	ExternalLink,
	SelectControl,
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
import ClipboardInputControl from './clipboard-input-control';
import type { SftpUser, SiteSshKey, ProfileSshKey } from '../../data/types';

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
	const userLocale = user.locale_variant || user.language || 'en';
	const { username } = sftpUsers[ 0 ];

	const userKeyIsAttached = useMemo( () => {
		if ( ! siteSshKeys ) {
			return false;
		}
		return !! siteSshKeys.find( ( { user_login }: SiteSshKey ) => user_login === user.username );
	}, [ siteSshKeys, user.username ] );

	const showSshKeysSelect = ! userKeyIsAttached && profileSshKeys && profileSshKeys.length > 0;

	const handleToggleSshAccess = () => {
		toggleSshAccessMutation.mutate();
	};

	const handleAttachSshKey = () => {
		attachSshKeyMutation.mutate( selectedSshKey );
	};

	const handleDetachSshKey = ( siteSshKey: SiteSshKey ) => {
		detachSshKeyMutation.mutate( siteSshKey );
	};

	const handleSelectedSshKeyChange = ( currentSelectedKey: string ) => {
		setSelectedSshKey( currentSelectedKey );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack>
						<Text size="15px" weight={ 500 } lineHeight="32px">
							{ __( 'SSH' ) }
						</Text>
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
									__nextHasNoMarginBottom
								/>

								{ siteSshKeys && siteSshKeys.length > 0 && (
									<>
										<Text>{ __( 'SSH Key' ) }</Text>
										<VStack>
											{ siteSshKeys.map( ( siteSshKey: SiteSshKey ) => (
												<Card key={ siteSshKey.sha256 }>
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
																isBusy={ detachSshKeyMutation.isPending }
																onClick={ () => handleDetachSshKey( siteSshKey ) }
															/>
														</HStack>
													</CardBody>
												</Card>
											) ) }
										</VStack>
									</>
								) }
								{ /* TODO: Use DataForm and add ReauthRequired */ }
								{ showSshKeysSelect && (
									<>
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

										<HStack justify="flex-start">
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
									</>
								) }
							</>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
