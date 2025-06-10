import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { blockTable } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteQuery } from '../../app/queries';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import { fetchPhpMyAdminToken } from '../../data';
import { canViewDatabaseSettings } from '../features';
import SettingsCallout from '../settings-callout';
import SettingsPageHeader from '../settings-page-header';
import calloutIllustrationUrl from './callout-illustration.svg';
import ResetPasswordModal from './reset-password-modal';

export default function SiteDatabaseSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const [ isFetchingToken, setIsFetchingToken ] = useState( false );
	const [ isResetPasswordModalOpen, setIsResetPasswordModalOpen ] = useState( false );

	if ( ! site ) {
		return null;
	}

	if ( ! canViewDatabaseSettings( site ) ) {
		return (
			<PageLayout
				size="small"
				header={
					<SettingsPageHeader
						title={ __( 'Database' ) }
						description={ __(
							'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
						) }
					/>
				}
			>
				<SettingsCallout
					siteSlug={ siteSlug }
					icon={ blockTable }
					image={ calloutIllustrationUrl }
					title={ __( 'Fast, familiar database access' ) }
					description={ __(
						'Access your site’s database with phpMyAdmin—perfect for inspecting data, running queries, and quick debugging.'
					) }
					tracksId="database"
				/>
			</PageLayout>
		);
	}

	const handleOpenPhpMyAdmin = async () => {
		setIsFetchingToken( true );

		try {
			const { token } = await fetchPhpMyAdminToken( siteSlug );
			if ( ! token ) {
				throw new Error( 'No token found' );
			}

			window.open( `https://wordpress.com/pma-login?token=${ token }` );
		} catch {
			createErrorNotice( __( 'Failed to fetch phpMyAdmin token.' ), { type: 'snackbar' } );
		}

		setIsFetchingToken( false );
	};

	const handleResetPasswordClick = () => {
		setIsResetPasswordModalOpen( true );
		recordTracksEvent( 'calypso_sites_dashboard_database_reset_password_click' );
	};

	const handleResetPasswordSuccess = () => {
		setIsResetPasswordModalOpen( false );
		createSuccessNotice( __( 'Your database password has been restored.' ), {
			type: 'snackbar',
		} );
	};

	const handleResetPasswordError = () => {
		setIsResetPasswordModalOpen( false );
		createErrorNotice(
			__( 'Sorry, we had a problem restoring your database password. Please try again.' ),
			{
				type: 'snackbar',
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Database' ) }
					description={ __(
						'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<VStack spacing={ 2 }>
							<Text size="15px" weight={ 500 } lineHeight="20px">
								phpMyAdmin
							</Text>
							<Text variant="muted" lineHeight="20px">
								{ __(
									'phpMyAdmin is a free open source software tool that allows you to administer your site’s MySQL database over the Web.'
								) }
							</Text>
						</VStack>
						<VStack>
							<Notice density="medium">
								{ __(
									'Managing a database can be tricky and it’s not necessary for your site to function.'
								) }
							</Notice>
						</VStack>
						<HStack justify="flex-start" expanded={ false } as="span">
							<Button variant="primary" isBusy={ isFetchingToken } onClick={ handleOpenPhpMyAdmin }>
								{ __( 'Open phpMyAdmin ↗' ) }
							</Button>
						</HStack>
						<Text variant="muted" lineHeight="20px">
							{ createInterpolateElement(
								__( 'Having problems with access? Try <link>resetting the password</link>.' ),
								{
									link: <Button variant="link" onClick={ handleResetPasswordClick } />,
								}
							) }
						</Text>
					</VStack>
				</CardBody>
			</Card>

			{ isResetPasswordModalOpen && (
				<ResetPasswordModal
					siteSlug={ siteSlug }
					onClose={ () => setIsResetPasswordModalOpen( false ) }
					onSuccess={ handleResetPasswordSuccess }
					onError={ handleResetPasswordError }
				/>
			) }
		</PageLayout>
	);
}
