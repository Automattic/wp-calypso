import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
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
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import RequiredSelect from '../../components/required-select';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canViewWordPressSettings } from '../features';
import SettingsPageHeader from '../settings-page-header';
import type { Field } from '@automattic/dataviews';

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canView = site && canViewWordPressSettings( site );

	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( siteSlug ),
		enabled: canView,
	} );
	const mutation = useMutation( siteWordPressVersionMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

	if ( ! site ) {
		return null;
	}

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'WordPress version' ),
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
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

	const isDirty = formData.version !== currentVersion;
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
			<Notice>
				<VStack>
					<Text as="p">
						{ sprintf(
							// translators: %s: WordPress version, e.g. 6.8
							__( 'Every WordPress.com site runs the latest WordPress version (%s).' ),
							getFormattedWordPressVersion( site )
						) }
					</Text>
					{ site.is_wpcom_atomic && (
						<Text as="p">
							{ createInterpolateElement(
								__(
									'Switch to a <a>staging site</a> to test a beta version of the next WordPress release.'
								),
								{
									// TODO: use correct v2 staging site URL when it's available.
									a: <a href={ `/staging-site/${ site.slug }` } />,
								}
							) }
						</Text>
					) }
				</VStack>
			</Notice>
		);
	};

	return (
		<PageLayout size="small" header={ <SettingsPageHeader title="WordPress" /> }>
			{ canView ? renderForm() : renderNotice() }
		</PageLayout>
	);
}
