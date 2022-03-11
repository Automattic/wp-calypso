import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type as domainType } from 'calypso/lib/domains/constants';
import { domainManagementTransfer } from 'calypso/my-sites/domains/paths';
import DomainInfoCard from '..';
import type { DomainInfoCardProps } from '../types';

const DomainTransferInfoCard = ( {
	domain,
	selectedSite,
}: DomainInfoCardProps ): JSX.Element | null => {
	const typesUnableToTransfer = [ domainType.TRANSFER, domainType.SITE_REDIRECT ] as const;
	const translate = useTranslate();

	if (
		! domain.currentUserIsOwner ||
		( domain.expired && ! domain.isRenewable ) ||
		typesUnableToTransfer.includes( domain.type ) ||
		domain.aftermarketAuction
	) {
		return null;
	}

	const getDescription = () => {
		switch ( domain.type ) {
			case domainType.MAPPED:
				return translate( 'Transfer this domain connection' );
			default:
				return translate( 'Transfer this domain' );
		}
	};

	return (
		<DomainInfoCard
			type="href"
			href={ domainManagementTransfer( selectedSite.slug, domain.name ) }
			title={ translate( 'Transfer' ) }
			description={
				domain.isLocked ? (
					<>
						<Icon icon={ lock } size={ 16 } viewBox="0 0 22 22" />
						{ translate( 'Transfer lock on' ) }
					</>
				) : (
					getDescription()
				)
			}
			ctaText={ translate( 'Transfer' ) }
		/>
	);
};

export default DomainTransferInfoCard;
