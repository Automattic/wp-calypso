import { JetpackModule, JetpackModules, Site } from '@automattic/api-core';
import { siteJetpackModulesMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { NavigationBlocker } from '../../../../app/navigation-blocker';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../../components/button-stack';
import { Card, CardBody } from '../../../../components/card';
import { SectionHeader } from '../../../../components/section-header';
import { isJetpackModuleActivated } from '../../../../utils/site-jetpack-modules';

const fields = [
	{
		id: 'protect',
		label: __( 'Enable brute force login protection' ),
		Edit: 'checkbox',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'protect' ],
};

export default function ProtectForm( {
	jetpackModules,
	site,
}: {
	jetpackModules: Record< string, JetpackModule > | undefined;
	site: Site;
} ) {
	const mutation = useMutation(
		withSnackbar( siteJetpackModulesMutation( site.ID ), {
			success: ( _data, { value } ) =>
				value
					? __( 'Brute force login protection enabled.' )
					: __( 'Brute force login protection disabled.' ),
			error: ( _error, { value } ) =>
				value
					? __( 'Failed to enable brute force login protection.' )
					: __( 'Failed to disable brute force login protection.' ),
		} )
	);

	const currentProtect = isJetpackModuleActivated( jetpackModules, JetpackModules.PROTECT );

	const [ formData, setFormData ] = useState< { protect: boolean } >( {
		protect: currentProtect,
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( { module: 'protect', value: formData.protect } );
	};

	const isDirty = formData.protect !== currentProtect;
	const { isPending } = mutation;

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ __( 'Brute force login protection' ) }
							description={ __(
								'Prevent and block unwanted login attempts from bots and hackers attempting to log in to your website with common username and password combinations.'
							) }
							level={ 3 }
						/>
						<NavigationBlocker shouldBlock={ isDirty } />
						<DataForm< { protect: boolean } >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: { protect?: boolean } ) => {
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
}
