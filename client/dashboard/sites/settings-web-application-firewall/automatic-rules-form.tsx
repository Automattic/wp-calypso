import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import { siteJetpackSettingsQuery, siteJetpackSettingsMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { hasHostingFeature, hasJetpackModule } from '../../utils/site-features';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { JetpackSettings, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fields: Field< JetpackSettings >[] = [
	{
		id: 'jetpack_waf_automatic_rules',
		label: __( 'Enable automatic firewall protection' ),
		Edit: 'checkbox',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'jetpack_waf_automatic_rules' ],
};

export default function AutomaticRulesForm( { site }: { site: Site } ) {
	const { data: jetpackSettings } = useSuspenseQuery( siteJetpackSettingsQuery( site.ID ) );
	const mutation = useMutation( siteJetpackSettingsMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// The WAF module is only supported on self-hosted Jetpack sites, and not supported on VIP
	const isFirewallModuleSupported =
		hasJetpackModule( site, JetpackModules.WAF ) &&
		isSelfHostedJetpackConnected( site ) &&
		! site.is_vip;

	const canUseAutomaticRules =
		hasHostingFeature( site, HostingFeatures.SCAN ) ||
		!! jetpackSettings?.jetpack_waf_automatic_rules_last_updated_timestamp;

	const currentEnabled = jetpackSettings?.jetpack_waf_automatic_rules ?? false;

	const [ formData, setFormData ] = useState< JetpackSettings >( {
		jetpack_waf_automatic_rules: currentEnabled,
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ ...formData },
			{
				onSuccess: () => {
					createSuccessNotice(
						formData.jetpack_waf_automatic_rules
							? __( 'Automatic firewall protection enabled.' )
							: __( 'Automatic firewall protection disabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice(
						formData.jetpack_waf_automatic_rules
							? __( 'Failed to enable automatic firewall protection.' )
							: __( 'Failed to disable automatic firewall protection.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	const isDirty = formData.jetpack_waf_automatic_rules !== currentEnabled;
	const { isPending } = mutation;

	if ( ! isFirewallModuleSupported || ! canUseAutomaticRules ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ __( 'Automatic firewall protection' ) }
							description={ __(
								'Block untrusted traffic sources by scanning every request made to your site. Jetpack’s advanced security rules are automatically kept up-to-date to protect your site from the latest threats.'
							) }
							level={ 3 }
						/>
						<NavigationBlocker shouldBlock={ isDirty } />
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
