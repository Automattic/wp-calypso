import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
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
import {
	siteQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
} from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import SettingsPageHeader from '../settings-page-header';
import { canUpdateWordPressVersion } from './utils';
import type { Field } from '@automattic/dataviews';

export default function WordPressVersionSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canUpdate = site && canUpdateWordPressVersion( site );

	const { data: version } = useQuery( {
		...siteWordPressVersionQuery( siteSlug ),
		enabled: canUpdate,
	} );
	const mutation = useMutation( siteWordPressVersionMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: version ?? '',
	} );

	if ( ! site ) {
		return null;
	}

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'WordPress version' ),
			Edit: 'select',
			elements: [
				{ value: 'latest', label: getFormattedWordPressVersion( site, 'latest' ) },
				{ value: 'beta', label: getFormattedWordPressVersion( site, 'beta' ) },
			],
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ 'version' ],
	};

	const isDirty = formData.version !== version;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.version, {
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

	const renderForm = () => {
		return (
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< { version: string } >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: { version?: string } ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<HStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		);
	};

	const renderNotice = () => {
		return (
			<Notice isDismissible={ false }>
				<Text>
					{ site.is_wpcom_atomic
						? createInterpolateElement(
								sprintf(
									// translators: %s: WordPress version, e.g. 6.8
									__(
										'Every WordPress.com site runs the latest WordPress version (%s). For testing purposes, you can switch to the beta version of the next WordPress release on <a>your staging site</a>.'
									),
									getFormattedWordPressVersion( site )
								),
								{
									// TODO: use correct staging site URL when it's available.
									// eslint-disable-next-line jsx-a11y/anchor-is-valid
									a: <a href="#" />,
								}
						  )
						: sprintf(
								// translators: %s: WordPress version, e.g. 6.8
								__( 'Every WordPress.com site runs the latest WordPress version (%s).' ),
								getFormattedWordPressVersion( site )
						  ) }
				</Text>
			</Notice>
		);
	};

	return (
		<PageLayout size="small">
			<SettingsPageHeader title="WordPress" />
			{ canUpdate ? renderForm() : renderNotice() }
		</PageLayout>
	);
}
