import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import DomainConnectionSetupSummary from '../domain-connection-setup/summary';
import DomainContactDetailsSettingsSummary from '../domain-contact-details/summary';
import DnsSettingsSummary from '../domain-dns/summary';
import DomainForwardingsSettingsSummary from '../domain-forwardings/summary';
import DomainSecuritySettingsSummary from '../domain-security/summary';
import NameServersSettingsSummary from '../name-servers/summary';
import DomainGlueRecordsSettingsSummary from '../overview-glue-records/summary';
export default function DomainOverviewSettings( { domain }: { domain: Domain } ) {
	const buttonListItems = [];

	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION && ! domain.points_to_wpcom ) {
		buttonListItems.push(
			<DomainConnectionSetupSummary key="connection-setup" domain={ domain } />
		);
	}

	if (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		! domain.is_gravatar_restricted_domain // TODO: should we show some notice for gravatar domains instead of just hiding the button?
	) {
		buttonListItems.push( <NameServersSettingsSummary key="name-servers" domain={ domain } /> );
	}

	if (
		[
			DomainSubtype.DOMAIN_REGISTRATION,
			DomainSubtype.DOMAIN_CONNECTION,
			DomainSubtype.DOMAIN_TRANSFER,
		].includes( domain.subtype.id ) &&
		domain.transfer_status !== DomainTransferStatus.PENDING_ASYNC &&
		domain.can_manage_dns_records
	) {
		buttonListItems.push( <DnsSettingsSummary key="dns" domain={ domain } /> );
		buttonListItems.push(
			<DomainForwardingsSettingsSummary key="forwardings" domain={ domain } />
		);
	}

	/**
	 * I simplified the condition heere because the original code seemed to have a logical redundancy.
	 * see: https://github.com/Automattic/wp-calypso/blob/b1c63880294fcf63f95518a3c42779236f56f5b2/client/my-sites/domains/domain-management/settings/index.tsx#L515
	 */
	if (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		domain.current_user_can_manage &&
		! domain.pending_transfer &&
		! domain.expired
	) {
		buttonListItems.push(
			<DomainContactDetailsSettingsSummary key="contact-details" domain={ domain } />
		);
	}

	/**
	 * TODO: review this one - we need to show the security for transfers but only if there is
	 * mapping. Right now I copied the code from the original code but it seems wrong
	 */
	if (
		[
			DomainSubtype.DOMAIN_REGISTRATION,
			DomainSubtype.DOMAIN_CONNECTION,
			DomainSubtype.DOMAIN_TRANSFER,
		].includes( domain.subtype.id ) &&
		domain.transfer_status !== DomainTransferStatus.PENDING_ASYNC
	) {
		buttonListItems.push( <DomainSecuritySettingsSummary key="security" domain={ domain } /> );
	}

	if (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		domain.current_user_can_manage &&
		domain.can_manage_dns_records
		// TODO: Add property that shows or hides this option depending on the availability of the feature
	) {
		buttonListItems.push(
			<DomainGlueRecordsSettingsSummary key="glue-records" domain={ domain } />
		);
	}

	return (
		buttonListItems.length > 0 && (
			<VStack spacing={ 3 }>
				<SectionHeader title={ __( 'Settings' ) } level={ 3 } />
				<SummaryButtonList>{ buttonListItems }</SummaryButtonList>
			</VStack>
		)
	);
}
