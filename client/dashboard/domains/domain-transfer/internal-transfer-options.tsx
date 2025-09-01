import { DomainSubtype } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { getTopLevelOfTld } from '../../utils/domain';
import type { Domain } from '@automattic/api-core';

const RESTRICTED_TRANSFER_TLDS = [ 'uk', 'fr', 'ca', 'de', 'jp' ];

interface InternalTransferOptionsProps {
	domain: Domain;
}

export default function InternalTransferOptions( { domain }: InternalTransferOptionsProps ) {
	const actions = [];

	if ( ! domain.is_domain_only_site && domain.can_transfer_to_any_user ) {
		const description =
			domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
				? __( 'Transfer this domain connection to any administrator on this site.' )
				: __( 'Transfer this domain to any administrator on this site.' );
		actions.push(
			<ActionList.ActionItem
				key="transfer-to-another-user"
				title={ __( 'Transfer to another user' ) }
				description={ description }
				actions={
					<RouterLinkButton
						variant="secondary"
						size="compact"
						to={ `/domains/${ domain.domain }/transfer/other-user` }
					>
						{ __( 'Continue' ) }
					</RouterLinkButton>
				}
			/>
		);
	} else if (
		! RESTRICTED_TRANSFER_TLDS.includes( getTopLevelOfTld( domain.domain ) ) &&
		domain.can_transfer_to_other_site
	) {
		actions.push(
			<ActionList.ActionItem
				key="transfer-to-any-user"
				title={ __( 'To another WordPress.com user' ) }
				description={ __( 'Transfer this domain to another WordPress.com user' ) }
				actions={
					<RouterLinkButton
						variant="secondary"
						size="compact"
						to={ `/domains/${ domain.domain }/transfer/any-user` }
					>
						{ __( 'Continue' ) }
					</RouterLinkButton>
				}
			/>
		);
	}

	if ( domain.can_transfer_to_other_site ) {
		const description =
			domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
				? __( 'Transfer this domain connection to any site you are an administrator on.' )
				: __( 'Transfer this domain to any site you are an administrator on.' );
		actions.push(
			<ActionList.ActionItem
				key="transfer-to-another-site"
				title={ __( 'To another WordPress.com site' ) }
				description={ description }
				actions={
					<RouterLinkButton
						variant="secondary"
						size="compact"
						to={ `/domains/${ domain.domain }/transfer/other-site` }
					>
						{ __( 'Continue' ) }
					</RouterLinkButton>
				}
			/>
		);
	}

	if ( actions.length > 0 ) {
		return <ActionList>{ actions }</ActionList>;
	}

	return null;
}
