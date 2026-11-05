import {
	DomainSubtype,
	DomainTransferStatus,
	type Domain,
	DomainDiagnostics,
	type DomainMappingStatus,
} from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { getCurrentDashboard } from '../../app/routing';
import { SectionHeader } from '../../components/section-header';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import DomainConnectionSetupSummary from '../domain-connection-setup/summary';
import DomainDiagnosticsSettingsSummary from '../domain-diagnostics/summary';
import DnsSettingsSummary from '../domain-dns/summary';
import DomainForwardingSettingsSummary from '../domain-forwarding/summary';
import DomainGlueRecordsSettingsSummary from '../domain-glue-records/summary';
import DomainSecuritySettingsSummary from '../domain-security/summary';
import NameServersSettingsSummary from '../name-servers/summary';
import { shouldShowTransferInAction } from './actions.utils';
import DomainEmailsSettingsSummary from './emails-summary';
import DomainSiteSettingsSummary from './site-summary';
import { useTrackOverviewItem } from './use-track-overview-item';

export default function DomainOverviewSettings( {
	domain,
	domainDiagnostics,
	domainMappingStatus,
	isDisabled,
}: {
	domain: Domain;
	domainDiagnostics: DomainDiagnostics | undefined;
	domainMappingStatus?: DomainMappingStatus;
	isDisabled?: boolean;
} ) {
	const trackItem = useTrackOverviewItem( domain );
	const [ showAdvanced, setShowAdvanced ] = useState( false );
	const buttonListItems = [
		<DomainSiteSettingsSummary
			key="site"
			domain={ domain }
			onClick={ () => trackItem( 'site' ) }
		/>,
		<DomainEmailsSettingsSummary
			key="emails"
			domain={ domain }
			onClick={ () => trackItem( 'emails' ) }
		/>,
	];
	const advancedButtonListItems = [];

	const isManageable =
		( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
			domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION ) &&
		domain.transfer_status !== DomainTransferStatus.PENDING_ASYNC;
	const canManageDns = isManageable && domain.can_manage_dns_records;

	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		buttonListItems.push(
			<DomainConnectionSetupSummary
				key="connection-setup"
				domain={ domain }
				domainMappingStatus={ domainMappingStatus }
				onClick={ () => trackItem( 'connection-setup' ) }
			/>
		);
	}

	if ( canManageDns ) {
		buttonListItems.push(
			<DomainForwardingSettingsSummary
				key="forwarding"
				domain={ domain }
				onClick={ () => trackItem( 'forwarding' ) }
			/>
		);
	}

	if (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		! domain.is_gravatar_restricted_domain // TODO: should we show some notice for gravatar domains instead of just hiding the button?
	) {
		buttonListItems.push(
			<NameServersSettingsSummary
				key="name-servers"
				domain={ domain }
				isDisabled={ isDisabled }
				onClick={ () => trackItem( 'name-servers' ) }
			/>
		);
	}

	if ( canManageDns ) {
		buttonListItems.push(
			<DnsSettingsSummary key="dns" domain={ domain } onClick={ () => trackItem( 'dns' ) } />
		);
	}

	if (
		domain.is_mapped_to_atomic_site &&
		domain.primary_domain &&
		domainDiagnostics !== undefined
	) {
		buttonListItems.push(
			<DomainDiagnosticsSettingsSummary
				key="diagnostics"
				domain={ domain }
				domainDiagnostics={ domainDiagnostics }
				onClick={ () => trackItem( 'diagnostics' ) }
			/>
		);
	}

	if ( isManageable ) {
		advancedButtonListItems.push(
			<DomainSecuritySettingsSummary
				key="security"
				domain={ domain }
				isDisabled={ isDisabled }
				onClick={ () => trackItem( 'security' ) }
			/>
		);
	}

	// `current_user_can_manage` is always false in a support session, but support can still
	// manage glue records on the user's behalf.
	if (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		( domain.current_user_can_manage || isSupportSession() ) &&
		domain.can_manage_dns_records
		// TODO: Add property that shows or hides this option depending on the availability of the feature
	) {
		advancedButtonListItems.push(
			<DomainGlueRecordsSettingsSummary
				key="glue-records"
				domainName={ domain.domain }
				isDisabled={ isDisabled }
				onClick={ () => trackItem( 'glue-records' ) }
			/>
		);
	}

	if ( shouldShowTransferInAction( domain ) ) {
		buttonListItems.push(
			<SummaryButton
				key="transfer-in"
				title={ __( 'Bring your domain to WordPress.com' ) }
				density="medium"
				href={ addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), {
					initialQuery: domain.domain,
					initialMode: 'transfer-domain',
					siteSlug: domain.site_slug,
					dashboard: getCurrentDashboard(),
					back_to: redirectToDashboardLink(),
				} ) }
				disabled={ isDisabled }
				onClick={ () => trackItem( 'transfer-in' ) }
			/>
		);
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader
				title={ __( 'Settings' ) }
				level={ 3 }
				actions={
					advancedButtonListItems.length > 0 && (
						<Button
							__next40pxDefaultSize
							variant="link"
							aria-expanded={ showAdvanced }
							onClick={ () => {
								trackItem( 'advanced-toggle', { expanded: ! showAdvanced } );
								setShowAdvanced( ! showAdvanced );
							} }
						>
							{ showAdvanced ? __( 'Hide advanced settings' ) : __( 'Show advanced settings' ) }
						</Button>
					)
				}
			/>
			<SummaryButtonList>
				{ showAdvanced ? [ ...buttonListItems, ...advancedButtonListItems ] : buttonListItems }
			</SummaryButtonList>
		</VStack>
	);
}
