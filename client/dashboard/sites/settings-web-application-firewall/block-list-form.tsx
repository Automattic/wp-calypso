import { JetpackModules } from '@automattic/api-core';
import { siteJetpackSettingsQuery, siteJetpackSettingsMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { TextareaControl, __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { hasJetpackModule } from '../../utils/site-features';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { JetpackSettings, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fields: Field< JetpackSettings >[] = [
	{
		id: 'jetpack_waf_ip_block_list_enabled',
		label: __( 'Enable blocking specific IP addresses' ),
		Edit: 'checkbox',
	},
	{
		id: 'jetpack_waf_ip_block_list',
		label: __( 'Blocked IP addresses' ),
		type: 'text',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<TextareaControl
					__nextHasNoMarginBottom
					disabled={ ! data.jetpack_waf_ip_block_list_enabled }
					// eslint-disable-next-line @wordpress/i18n-hyphenated-range
					help={ __(
						'IPv4 and IPv6 are acceptable. To specify a range, enter the low value and high value separated by a dash. Example: 12.12.12.1-12.12.12.100'
					) }
					label={ hideLabelFromVision ? '' : field.label }
					onChange={ ( value ) => onChange( { [ id ]: value } ) }
					rows={ 4 }
					value={ getValue( { item: data } ) || '' }
				/>
			);
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'jetpack_waf_ip_block_list_enabled', 'jetpack_waf_ip_block_list' ],
};

export default function BlockListForm( { site }: { site: Site } ) {
	const { data: jetpackSettings } = useSuspenseQuery( siteJetpackSettingsQuery( site.ID ) );
	const mutation = useMutation( {
		...siteJetpackSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Blocked IP addresses saved.' ),
				error: __( 'Failed to save blocked IP addresses.' ),
			},
		},
	} );

	// The WAF module is only supported on self-hosted Jetpack sites, and not supported on VIP
	const isFirewallModuleSupported =
		hasJetpackModule( site, JetpackModules.WAF ) &&
		isSelfHostedJetpackConnected( site ) &&
		! site.is_vip;

	const currentEnabled = jetpackSettings?.jetpack_waf_ip_block_list_enabled ?? false;
	const currentList = jetpackSettings?.jetpack_waf_ip_block_list ?? '';

	const [ formData, setFormData ] = useState< JetpackSettings >( {
		jetpack_waf_ip_block_list_enabled: currentEnabled,
		jetpack_waf_ip_block_list: currentList,
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( { ...formData } );
	};

	const isDirty =
		formData.jetpack_waf_ip_block_list_enabled !== currentEnabled ||
		formData.jetpack_waf_ip_block_list !== currentList;
	const { isPending } = mutation;

	if ( ! isFirewallModuleSupported ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ __( 'Block specific IP addresses' ) }
							description={ __(
								'IP addresses added to this list will be blocked from accessing your site.'
							) }
							level={ 3 }
						/>
						<DataForm< JetpackSettings >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< JetpackSettings > ) => {
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
