import { HostingFeatures, fetchPhpMyAdminToken } from '@automattic/api-core';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSuspenseQuery } from '@tanstack/react-query';
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
import { siteBySlugQuery } from '../../app/queries/site';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SettingsPageHeader from '../settings-page-header';
import ResetPasswordModal from './reset-password-modal';
import upsellIllustrationUrl from './upsell-illustration.svg';

export default function SiteDatabaseSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const [ isFetchingToken, setIsFetchingToken ] = useState( false );
	const [ isResetPasswordModalOpen, setIsResetPasswordModalOpen ] = useState( false );

	const handleOpenPhpMyAdmin = async () => {
		setIsFetchingToken( true );

		try {
			const token = await fetchPhpMyAdminToken( site.ID );
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
					description={ createInterpolateElement(
						__(
							'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL. <link>Learn more</link>'
						),
						{
							link: <InlineSupportLink supportContext="hosting-mysql" />,
						}
					) }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.DATABASE }
				tracksFeatureId="settings-database"
				upsellIcon={ blockTable }
				upsellImage={ upsellIllustrationUrl }
				upsellTitle={ __( 'Fast, familiar database access' ) }
				upsellDescription={ __(
					'Access your site’s database with phpMyAdmin—perfect for inspecting data, running queries, and quick debugging.'
				) }
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
								<Button
									variant="primary"
									isBusy={ isFetchingToken }
									onClick={ handleOpenPhpMyAdmin }
								>
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
						siteId={ site.ID }
						onClose={ () => setIsResetPasswordModalOpen( false ) }
						onSuccess={ handleResetPasswordSuccess }
						onError={ handleResetPasswordError }
					/>
				) }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
