import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import { siteQuery, sitePHPVersionQuery, sitePHPVersionMutation } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { canUpdatePHPVersion } from './utils';
import type { Field } from '@automattic/dataviews';

export default function PHPVersionSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canUpdate = site && canUpdatePHPVersion( site );

	const { data: currentVersion } = useQuery( {
		...sitePHPVersionQuery( siteSlug ),
		enabled: canUpdate,
	} );
	const mutation = useMutation( sitePHPVersionMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

	if ( ! site ) {
		return null;
	}

	const { phpVersions } = getPHPVersions();

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'PHP version' ),
			Edit: 'select',
			elements: phpVersions.filter( ( option ) => {
				// Show disabled PHP version only if the site is still using it.
				if ( option.disabled && option.value !== currentVersion ) {
					return false;
				}
				return true;
			} ),
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

	const renderCallout = () => {
		return <p>TODO: callout</p>;
	};

	return (
		<PageLayout size="small">
			<SettingsPageHeader title="PHP" />
			{ canUpdate ? renderForm() : renderCallout() }
		</PageLayout>
	);
}
