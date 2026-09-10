import { getDataCenterOptions } from '@automattic/api-core';
import { pendingAgencySitesQuery, provisionAgencySiteMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	CheckboxControl,
	Modal,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import SuffixInputControl from '../../../components/input-control/suffix-input-control';
import { trackProvisioningSite } from '../provisioning-sites';
import { useSiteAddress } from './use-site-address';
import type { SiteAddress } from './use-site-address';
import type { DataFormControlProps, Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

// Agency licenses provision Atomic sites, which land on `.wpcomstaging.com`.
// Availability is still checked against the `wordpress.com` namespace, which is
// what the validation endpoint takes.
const DOMAIN_SUFFIX = '.wpcomstaging.com';

const HELP_CENTER_URL = 'https://wordpress.com/support/help-support-options/#how-to-contact-us';
const HOSTING_FEATURES_URL =
	'https://developer.wordpress.com/docs/developer-tools/web-server-settings/';

type SiteConfigurationFormData = {
	php_version: string;
	primary_data_center: string;
	allow_client_access: boolean;
};

function AddressField( { siteAddress }: { siteAddress: SiteAddress } ) {
	const { recordTracksEvent } = useAnalytics();

	const { alternative } = siteAddress;
	let help: ReactNode = __( 'You can connect a custom domain once the site is created.' );

	if ( siteAddress.formatError ) {
		help = siteAddress.formatError;
	} else if ( siteAddress.isChecking ) {
		help = __( 'Checking availability…' );
	} else if ( siteAddress.isTaken ) {
		help = alternative
			? createInterpolateElement( __( 'Sorry, that address is taken. How about <suggestion />?' ), {
					suggestion: (
						<Button
							variant="link"
							onClick={ () => {
								recordTracksEvent( 'calypso_a4a_create_site_config_suggested_name' );
								siteAddress.setAddress( alternative );
							} }
						>
							{ alternative }
						</Button>
					),
			  } )
			: __( 'Sorry, that address is taken.' );
	}

	return (
		<SuffixInputControl
			__next40pxDefaultSize
			label={ __( 'Site address' ) }
			suffix={ DOMAIN_SUFFIX }
			value={ siteAddress.address }
			// The span keeps one element mounted across every help state: swapping
			// a bare string for an element here crashes React under Google
			// Translate (react/react#11538).
			help={ <span>{ help }</span> }
			disabled={ siteAddress.isSuggesting }
			spellCheck="false"
			onChange={ ( value?: string ) => siteAddress.setAddress( ( value ?? '' ).toLowerCase() ) }
		/>
	);
}

function ClientAccessField( {
	field,
	data,
	onChange,
}: DataFormControlProps< SiteConfigurationFormData > ) {
	return (
		<CheckboxControl
			__nextHasNoMarginBottom
			label={ __( 'Allow clients to use the Help Center and hosting features' ) }
			help={ createInterpolateElement(
				__(
					'Clients can reach <help>WordPress.com support</help> and change <hosting>hosting features</hosting> themselves. Leave this off to keep the site fully managed by your agency.'
				),
				{
					help: (
						<Button
							variant="link"
							href={ localizeUrl( HELP_CENTER_URL ) }
							target="_blank"
							rel="noreferrer"
						/>
					),
					hosting: (
						<Button variant="link" href={ HOSTING_FEATURES_URL } target="_blank" rel="noreferrer" />
					),
				}
			) }
			checked={ data.allow_client_access }
			onChange={ ( value: boolean ) => onChange( { [ field.id ]: value } ) }
		/>
	);
}

export default function SiteConfigurationModal( {
	agencyId,
	pendingSiteId,
	onRequestClose,
}: {
	agencyId: number;
	pendingSiteId: number;
	onRequestClose: () => void;
} ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const siteAddress = useSiteAddress( agencyId );
	const { phpVersions, recommendedValue } = getPHPVersions();

	const [ formData, setFormData ] = useState< SiteConfigurationFormData >( {
		php_version: recommendedValue,
		primary_data_center: '',
		allow_client_access: true,
	} );

	const mutation = useMutation(
		withSnackbar( provisionAgencySiteMutation( agencyId ), {
			success: __( 'Site creation started.' ),
			// The server explains itself here — an address claimed since we checked
			// it, a blocked account, an unverified email — and a generic message
			// would leave the agency with nothing to act on.
			error: { source: 'server' },
		} )
	);

	const fields: Field< SiteConfigurationFormData >[] = [
		{
			id: 'php_version',
			label: __( 'PHP version' ),
			Edit: 'select',
			elements: phpVersions.filter( ( version ) => ! version.disabled ),
		},
		{
			id: 'primary_data_center',
			label: __( 'Primary data center' ),
			Edit: 'select',
			elements: [
				{ value: '', label: __( 'No preference' ) },
				...Object.entries( getDataCenterOptions() ).map( ( [ value, label ] ) => ( {
					value,
					label,
				} ) ),
			],
		},
		{
			id: 'allow_client_access',
			label: __( 'Client access' ),
			Edit: ClientAccessField,
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'php_version', 'primary_data_center', 'allow_client_access' ],
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		const configuration = {
			php_version: formData.php_version,
			primary_data_center: formData.primary_data_center || undefined,
			is_fully_managed_agency_site: ! formData.allow_client_access,
		};

		recordTracksEvent( 'calypso_a4a_create_site_config_submit', configuration );

		mutation.mutate(
			{ ...configuration, id: pendingSiteId, site_name: siteAddress.address },
			{
				onSuccess: () => {
					queryClient.invalidateQueries( {
						queryKey: pendingAgencySitesQuery( agencyId ).queryKey,
					} );
					// The sites page reports on it from here; the site itself takes
					// a few minutes to answer.
					trackProvisioningSite( pendingSiteId );
					// The next site gets its own address rather than the one just claimed.
					siteAddress.refreshSuggestion();
					onRequestClose();
					navigate( { to: '/sites' } );
				},
				// The address is checked before submit but only claimed by the
				// provision itself, so anything that failed may have failed on the
				// name. Re-check it so the field can say so.
				onError: () => siteAddress.revalidate(),
			}
		);
	};

	const handleRequestClose = () => {
		if ( ! mutation.isPending ) {
			recordTracksEvent( 'calypso_a4a_create_site_config_close' );
			onRequestClose();
		}
	};

	return (
		<Modal
			title={ __( 'Configure your new site' ) }
			size="medium"
			onRequestClose={ handleRequestClose }
		>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<AddressField siteAddress={ siteAddress } />
					<DataForm< SiteConfigurationFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< SiteConfigurationFormData > ) =>
							setFormData( ( current ) => ( { ...current, ...edits } ) )
						}
					/>
					<ButtonStack justify="flex-end">
						<Button
							variant="tertiary"
							disabled={ mutation.isPending }
							onClick={ handleRequestClose }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ ! siteAddress.isReady || mutation.isPending }
						>
							{ __( 'Create site' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
