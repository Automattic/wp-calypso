import {
	siteBySlugQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canViewWordPressSettings } from '../features';
import type { Field } from '@wordpress/dataviews';

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const canView = canViewWordPressSettings( site );

	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: canView,
	} );
	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'WordPress version saved.' ),
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

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
		layout: { type: 'regular' as const },
		fields: [ 'version' ],
	};

	const isDirty = formData.version !== currentVersion;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.version );
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
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
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
									'Switch to a staging site to test a beta version of the next WordPress release. <learnMoreLink />'
								),
								{
									learnMoreLink: <InlineSupportLink supportContext="switch-to-staging-site" />,
								}
							) }
						</Text>
					) }
				</VStack>
			</Notice>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="WordPress"
					description={ __( 'Manage your WordPress version.' ) }
				/>
			}
		>
			{ canView ? renderForm() : renderNotice() }
		</PageLayout>
	);
}
