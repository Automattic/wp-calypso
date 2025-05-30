import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Notice,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteQuery, siteDefensiveModeQuery, siteDefensiveModeMutation } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { DefensiveModeSettingsUpdate, Site } from '../../data/types';
import type { Field } from '@automattic/dataviews';

export function canUpdateDefensiveMode( site: Site ) {
	return site.is_wpcom_atomic;
}

const availableTtls = [
	{
		label: __( '1 hour' ),
		value: '3600',
	},
	{
		label: __( '12 hours' ),
		value: '43200',
	},
	{
		label: __( '24 hours' ),
		value: '86400',
	},
	{
		label: __( '2 days' ),
		value: '172800',
	},
	{
		label: __( '7 days' ),
		value: '604800',
	},
];

const fields: Field< { ttl: string } >[] = [
	{
		id: 'ttl',
		label: __( 'Duration' ),
		Edit: 'select',
		elements: availableTtls,
	},
];

const form = {
	type: 'regular' as const,
	fields: [ 'ttl' ],
};

export default function DefensiveModeSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canUpdate = site && canUpdateDefensiveMode( site );

	const { data } = useQuery( {
		...siteDefensiveModeQuery( siteSlug ),
		enabled: canUpdate,
	} );
	const mutation = useMutation( siteDefensiveModeMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< { ttl: string } >( {
		ttl: availableTtls[ 0 ].value,
	} );

	if ( ! canUpdate ) {
		throw notFound();
	}

	if ( ! data ) {
		return null;
	}

	const { isPending } = mutation;

	const handleSubmit = ( data: DefensiveModeSettingsUpdate ) => {
		mutation.mutate( data, {
			onSuccess: () => {
				createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const { enabled, enabled_by_a11n, enabled_until } = data;

	const renderEnabled = () => {
		const date = new Date( enabled_until * 1000 );
		const enabledUntil = date.toLocaleString( undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
		} );

		const handleDisable = () => {
			handleSubmit( {
				active: false,
			} );
		};

		return (
			<Notice status="success" isDismissible={ false }>
				<Text as="p">{ __( 'Defensive mode is enabled' ) }</Text>

				{ enabled_by_a11n && (
					<Text as="p">
						{ createInterpolateElement(
							__(
								'We’ve enabled defensive mode to protect your site. <link>Contact a Happiness Engineer</link> if you need assistance.'
							),
							{
								// @ts-expect-error children prop is injected by createInterpolateElement
								link: <ExternalLink href="/help/contact" />,
							}
						) }
					</Text>
				) }

				<Text as="p">
					{ sprintf(
						// translators: %s: timestamp, e.g. May 27, 2025 11:02 AM
						__( 'This will be automatically disabled on %s.' ),
						enabledUntil
					) }
				</Text>

				{ ! enabled_by_a11n && (
					<Button
						variant="primary"
						type="submit"
						isBusy={ isPending }
						disabled={ isPending }
						onClick={ handleDisable }
					>
						{ __( 'Disable' ) }
					</Button>
				) }
			</Notice>
		);
	};

	const renderDisabled = () => {
		const handleEnable = ( event: React.FormEvent ) => {
			event.preventDefault();
			handleSubmit( {
				active: true,
				ttl: Number( formData.ttl ),
			} );
		};

		return (
			<VStack spacing={ 8 }>
				<Notice status="info" isDismissible={ false }>
					<Text>{ __( 'Defensive mode is disabled' ) }</Text>
				</Notice>
				<Card>
					<CardBody>
						<VStack spacing={ 8 } style={ { padding: '8px 0' } }>
							<Text size="15px" weight={ 500 } lineHeight="20px">
								{ __( 'Enable defensive mode' ) }
							</Text>

							<form onSubmit={ handleEnable }>
								<VStack spacing={ 4 }>
									<DataForm< { ttl: string } >
										data={ formData }
										fields={ fields }
										form={ form }
										onChange={ ( edits: { ttl?: string } ) => {
											setFormData( ( data ) => ( { ...data, ...edits } ) );
										} }
									/>
									<HStack justify="flex-start">
										<Button
											variant="primary"
											type="submit"
											isBusy={ isPending }
											disabled={ isPending }
										>
											{ __( 'Enable' ) }
										</Button>
									</HStack>
								</VStack>
							</form>
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		);
	};

	return (
		<PageLayout size="small" header={ <SettingsPageHeader title={ __( 'Defensive mode' ) } /> }>
			{ enabled ? renderEnabled() : renderDisabled() }
		</PageLayout>
	);
}
