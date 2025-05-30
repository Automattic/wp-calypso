import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import type { SiteVisibility } from '../../data/types';
import type { Field, Form } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

const fields: Field< SiteVisibility >[] = [
	{
		id: 'visibility',
		Edit: 'toggleGroup',
		elements: [
			{
				label: __( 'Coming soon' ),
				value: 'coming-soon',
				description: __(
					'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
				),
			},
			{
				label: __( 'Public' ),
				value: 'public',
				description: __( 'Your site is visible to everyone.' ),
			},
			{
				label: __( 'Private' ),
				value: 'private',
				description: __(
					'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
				),
			},
		],
	},
	{
		id: 'discourage_search_engines',
		Edit: 'checkbox',
		label: __( 'Discourage search engines from indexing this site' ),
		description: __(
			'This does not block access to your site — it is up to search engines to honor your request.'
		),
		isVisible: ( data ) => data.visibility === 'public',
	},
	{
		id: 'data_sharing_opt_out',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				checked={ field.getValue( { item: data } ) }
				disabled={ data.discourage_search_engines }
				onChange={ () => {
					onChange( { [ field.id ]: ! field.getValue( { item: data } ) } );
				} }
				help={ createInterpolateElement(
					__(
						'This will present this site’s content from being shared with our licensed network of content and research partners, including those that train AI models. <a>Learn more</a>'
					),
					{
						a: (
							// TODO investigate whether localizeUrl() is safe to import into dashboard
							<ExternalLink
								/* eslint-disable-next-line wpcalypso/i18n-unlocalized-url */
								href="https://wordpress.com/support/privacy-settings/make-your-website-public/#prevent-third-party-sharing"
								children={ null } // ExternalLink's children prop is marked as required
							/>
						),
					}
				) }
			/>
		),
		label: __( 'Prevent third-party sharing for this site' ),
		isVisible: ( data ) => data.visibility === 'public',
	},
];

const form = {
	type: 'regular',
	fields: [
		{ id: 'visibility', labelPosition: 'none' },
		'discourage_search_engines',
		'data_sharing_opt_out',
	],
} satisfies Form;

export function PrivacyForm( {
	siteVisibility,
	mutation,
}: {
	siteVisibility: SiteVisibility;
	mutation: UseMutationResult< SiteVisibility, Error, SiteVisibility, unknown >;
} ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState( {
		...siteVisibility,
		data_sharing_opt_out:
			siteVisibility.discourage_search_engines || siteVisibility.data_sharing_opt_out,
	} );

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => siteVisibility[ key as keyof SiteVisibility ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ ...formData },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
				},
			}
		);
	};

	return (
		<form onSubmit={ handleSubmit } className="dashboard-site-settings-privacy-form">
			<VStack spacing={ 4 }>
				<DataForm< SiteVisibility >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< SiteVisibility > ) => {
						setFormData( ( data ) => {
							const newFormData = { ...data, ...edits };

							if ( edits.visibility !== undefined ) {
								// Forget any previous edits to the discoverability controls when the visibility changes.
								newFormData.discourage_search_engines = siteVisibility.discourage_search_engines;
								newFormData.data_sharing_opt_out =
									siteVisibility.discourage_search_engines || siteVisibility.data_sharing_opt_out;
							}

							if ( edits.discourage_search_engines === true ) {
								// Checking the search engine box forces the third party checkbox too.
								newFormData.data_sharing_opt_out = true;
							}

							return newFormData;
						} );
					} }
				/>
				<HStack justify="flex-start">
					<Button
						variant="primary"
						__next40pxDefaultSize
						type="submit"
						isBusy={ isPending }
						disabled={ isPending || ! isDirty }
					>
						{ __( 'Save' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
