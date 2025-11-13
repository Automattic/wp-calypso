import { siteSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import type { Site, SiteSettings } from '@automattic/api-core';

interface AIAssistantFormData {
	bigSkyEnabled: boolean;
}

export function AIAssistantForm( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'AI Site Assistant settings saved.' ),
				error: __( 'Failed to save AI Site Assistant settings.' ),
			},
		},
	} );

	const initialData = fromSiteSettings( settings );
	const [ formData, setFormData ] = useState< AIAssistantFormData >( () => ( {
		...initialData,
	} ) );

	const isDirty = Object.entries( initialData ).some(
		( [ key, value ] ) => formData[ key as keyof AIAssistantFormData ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( toSiteSettings( formData ) );
	};

	const handleChange = ( edits: Partial< AIAssistantFormData > ) => {
		setFormData( ( data ) => ( { ...data, ...edits } ) );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit } className="dashboard-site-settings-ai-assistant-form">
					<VStack spacing={ 4 }>
						<CheckboxControl
							__nextHasNoMarginBottom
							label={ __( 'Enable Big Sky' ) }
							checked={ formData.bigSkyEnabled }
							onChange={ ( checked ) => handleChange( { bigSkyEnabled: checked } ) }
							help={ __( 'Enable Big Sky features for this site.' ) }
						/>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								__next40pxDefaultSize
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

function fromSiteSettings( settings: SiteSettings ): AIAssistantFormData {
	return {
		bigSkyEnabled: Boolean( settings.big_sky_enable ),
	};
}

function toSiteSettings( formData: AIAssistantFormData ): Partial< SiteSettings > {
	return {
		big_sky_enable: formData.bigSkyEnabled,
	};
}
