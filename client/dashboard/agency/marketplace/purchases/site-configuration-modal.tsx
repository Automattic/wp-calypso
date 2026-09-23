import { getDataCenterOptions } from '@automattic/api-core';
import {
	activeAgencyQuery,
	agencyPendingSitesQuery,
	provisionAgencyDevSiteMutation,
	provisionAgencySiteMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	CheckboxControl,
	ExternalLink,
	Modal,
	Spinner,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import SuffixInputControl from '../../../components/input-control/suffix-input-control';
import Notice from '../../../components/notice';
import { trackProvisioningSite } from '../../sites/provisioning-sites';
import { useSiteAddress } from './use-site-address';
import type { SiteAddress } from './use-site-address';
import type { JetpackLicense, AgencyPendingSite } from '@automattic/api-core';
import type { DataFormControlProps, Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

// Agency licenses provision Atomic sites, which land on `.wpcomstaging.com`.
// Availability is still checked against the `wordpress.com` namespace, which is
// what the validation endpoint takes.
const DOMAIN_SUFFIX = '.wpcomstaging.com';

const HELP_CENTER_URL = 'https://wordpress.com/support/help-support-options/#how-to-contact-us';
const HOSTING_FEATURES_URL =
	'https://developer.wordpress.com/docs/developer-tools/web-server-settings/';
const DEV_LICENSES_URL =
	'https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting';

type SiteConfigurationFormData = {
	php_version: string;
	primary_data_center: string;
	allow_client_access: boolean;
};

/**
 * The pending site this license will become. `provisioning` does not count:
 * creation has already started, so there is nothing left to configure.
 *
 * Takes the raw response: a payload that is not the expected list should leave
 * the modal saying there is nothing to set up, not throw mid-render.
 */
function findPendingSite( data: unknown, licenseKey: string ): AgencyPendingSite | undefined {
	if ( ! Array.isArray( data ) ) {
		return undefined;
	}

	return ( data as AgencyPendingSite[] ).find(
		( { features } ) =>
			features?.wpcom_atomic?.license_key === licenseKey &&
			features?.wpcom_atomic?.state === 'pending'
	);
}

function AddressField( { siteAddress }: { siteAddress: SiteAddress } ) {
	const { recordTracksEvent } = useAnalytics();

	const { alternative } = siteAddress;
	let help: ReactNode = __( 'You can connect a custom domain once the site is created.' );
	let invalidMessage: string | undefined;

	if ( siteAddress.formatError ) {
		invalidMessage = siteAddress.formatError;
	} else if ( siteAddress.isChecking ) {
		help = __( 'Checking availability…' );
	} else if ( siteAddress.isTaken ) {
		invalidMessage = __( 'Sorry, that address is taken.' );
		// The validity message is plain text, so the clickable suggestion stays in the help.
		help = alternative
			? createInterpolateElement(
					__(
						/* translators: <suggestion /> is a free site address close to the one that was taken, e.g. example2 */
						'How about <suggestion />?'
					),
					{
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
					}
				)
			: '';
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
			customValidity={ invalidMessage ? { type: 'invalid', message: invalidMessage } : undefined }
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

/**
 * A development site has no client-access choice to make: clients stay locked
 * out until it launches. The checkbox above is replaced by classic's
 * explanation of that.
 */
function DevSiteClientAccess() {
	return (
		<Text variant="muted" as="p">
			{ createInterpolateElement(
				__(
					'Clients can’t access the <help>WordPress.com Help Center</help> or <hosting>hosting features</hosting> on development sites. Once the site is launched, enable access in Site Settings. <learn>Learn more</learn>'
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
					learn: (
						<Button variant="link" href={ DEV_LICENSES_URL } target="_blank" rel="noreferrer" />
					),
				}
			) }
		</Text>
	);
}

interface BaseConfigurationFormProps {
	agencyId: number;
	closeModal?: () => void;
	/** Lets a surrounding modal hold itself open until the site is created. */
	onCreatingChange?: ( isCreating: boolean ) => void;
}

/**
 * Which site is being created has to be stated rather than inferred from a
 * missing id: a pending site that came back without one would otherwise spend a
 * free development license on a site the agency has already paid for.
 */
type SiteConfigurationFormProps =
	| ( BaseConfigurationFormProps & { isDevSite: true } )
	| ( BaseConfigurationFormProps & { isDevSite: false; pendingSiteId: number } );

function SiteConfigurationForm( props: SiteConfigurationFormProps ) {
	const { agencyId, closeModal, onCreatingChange, isDevSite } = props;
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const siteAddress = useSiteAddress( agencyId );
	const { phpVersions, recommendedValue } = getPHPVersions();

	const [ formData, setFormData ] = useState< SiteConfigurationFormData >( {
		php_version: recommendedValue,
		primary_data_center: '',
		allow_client_access: true,
	} );

	const snackbar = {
		success: __( 'Site creation started.' ),
		// The server explains itself here — an address claimed since we checked
		// it, a blocked account, an unverified email — and a generic message
		// would leave the agency with nothing to act on.
		error: { source: 'server' } as const,
	};
	// Both are instantiated because hooks cannot be called conditionally; only
	// the one matching this modal's flavour is ever submitted.
	const provisionSite = useMutation(
		withSnackbar( provisionAgencySiteMutation( agencyId ), snackbar )
	);
	const provisionDevSite = useMutation(
		withSnackbar( provisionAgencyDevSiteMutation( agencyId ), snackbar )
	);
	const isCreating = provisionSite.isPending || provisionDevSite.isPending;

	useEffect( () => {
		onCreatingChange?.( isCreating );
	}, [ isCreating, onCreatingChange ] );

	const fields: Field< SiteConfigurationFormData >[] = [
		{
			id: 'php_version',
			label: __( 'PHP version' ),
			description: createInterpolateElement(
				__(
					'The PHP version can be changed after your site is created via <link>Web Server Settings</link>.'
				),
				{
					link: <ExternalLink href={ HOSTING_FEATURES_URL } children={ null } />,
				}
			),
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
		fields: isDevSite
			? [ 'php_version', 'primary_data_center' ]
			: [ 'php_version', 'primary_data_center', 'allow_client_access' ],
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		const configuration = {
			php_version: formData.php_version,
			primary_data_center: formData.primary_data_center || undefined,
			// A development site is always fully managed; the checkbox that decides
			// this for a paid site is not offered for one.
			is_fully_managed_agency_site: isDevSite || ! formData.allow_client_access,
		};

		recordTracksEvent( 'calypso_a4a_create_site_config_submit', {
			...configuration,
			is_dev_site: isDevSite,
		} );

		const onCreated = ( siteId: number ) => {
			// The sites page reports on it from here.
			trackProvisioningSite( siteId );
			// The next site gets its own address, not the one just claimed.
			siteAddress.refreshSuggestion();
			closeModal?.();
			navigate( { to: '/sites' } );
		};

		// The address is only claimed by the provision itself, so a failure may
		// have been about the name. Re-check it so the field can say so.
		const onError = () => siteAddress.revalidate();

		if ( props.isDevSite ) {
			// A development site has no pending record to provision, so the
			// response is the only place its id comes from.
			provisionDevSite.mutate(
				{ ...configuration, site_name: siteAddress.address },
				{ onSuccess: ( { site } ) => onCreated( site.id ), onError }
			);
		} else {
			const { pendingSiteId } = props;
			provisionSite.mutate(
				{ ...configuration, id: pendingSiteId, site_name: siteAddress.address },
				{ onSuccess: () => onCreated( pendingSiteId ), onError }
			);
		}
	};

	return (
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
				{ isDevSite && <DevSiteClientAccess /> }
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						disabled={ isCreating }
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_create_site_config_close' );
							closeModal?.();
						} }
					>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						isBusy={ isCreating }
						disabled={ ! siteAddress.isReady || isCreating }
					>
						{ __( 'Create site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

function NothingToConfigure( { closeModal }: { closeModal?: () => void } ) {
	return (
		<VStack spacing={ 6 }>
			<Text>
				{ __(
					'This license has no site left to set up. If you just created one, it may still be provisioning.'
				) }
			</Text>
			<ButtonStack justify="flex-end">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ closeModal }>
					{ __( 'Close' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}

export default function SiteConfigurationModal( {
	license,
	closeModal,
}: {
	license: JetpackLicense;
	closeModal?: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency, isLoading: isLoadingAgency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: pendingSites, isLoading: isLoadingPendingSites } = useQuery( {
		...agencyPendingSitesQuery( agencyId ),
		enabled: agencyId > 0,
	} );

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_create_site_config' );
	}, [ recordTracksEvent ] );

	if ( isLoadingAgency || isLoadingPendingSites ) {
		return (
			<VStack spacing={ 4 } alignment="center">
				<Spinner />
			</VStack>
		);
	}

	const pendingSite = findPendingSite( pendingSites, license.license_key );

	if ( ! pendingSite ) {
		return <NothingToConfigure closeModal={ closeModal } />;
	}

	return (
		<SiteConfigurationForm
			agencyId={ agencyId }
			isDevSite={ false }
			pendingSiteId={ pendingSite.id }
			closeModal={ closeModal }
		/>
	);
}

/**
 * Creating a free development site. It is opened straight from a CTA rather
 * than a DataViews action, so unlike the license modal above it brings its own
 * `<Modal>`, and there is no pending site to look up first.
 */
export function DevSiteConfigurationModal( { closeModal }: { closeModal: () => void } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency, isLoading } = useQuery( activeAgencyQuery() );
	const [ isCreating, setIsCreating ] = useState( false );

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_create_site_config' );
	}, [ recordTracksEvent ] );

	return (
		<Modal
			title={ __( 'Configure your new site' ) }
			size="medium"
			onRequestClose={ () => {
				recordTracksEvent( 'calypso_a4a_create_site_config_close' );
				closeModal();
			} }
			// Closing mid-creation unmounts the observer, so the site lands
			// server-side and nothing redirects, tracks it or says how it went.
			isDismissible={ ! isCreating }
			shouldCloseOnEsc={ ! isCreating }
			shouldCloseOnClickOutside={ ! isCreating }
		>
			{ isLoading && (
				<VStack spacing={ 4 } alignment="center">
					<Spinner />
				</VStack>
			) }
			{ ! isLoading && ! agency?.id && (
				<Notice variant="error">
					{ __( 'We couldn’t load your agency details. Please refresh the page and try again.' ) }
				</Notice>
			) }
			{ ! isLoading && !! agency?.id && (
				<SiteConfigurationForm
					agencyId={ agency.id }
					isDevSite
					closeModal={ closeModal }
					onCreatingChange={ setIsCreating }
				/>
			) }
		</Modal>
	);
}
