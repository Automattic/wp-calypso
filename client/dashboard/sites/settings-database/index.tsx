import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	Notice,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { fetchPhpMyAdminToken } from '../../data';
import SettingsPageHeader from '../settings-page-header';
import type { Site } from '../../data/types';

export function canOpenPhpMyAdmin( site: Site ) {
	return site.is_wpcom_atomic;
}

export default function SiteDatabaseSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ isFetchingToken, setIsFetchingToken ] = useState( false );

	if ( ! site || ! canOpenPhpMyAdmin( site ) ) {
		return null;
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
							<Notice isDismissible={ false }>
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
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
