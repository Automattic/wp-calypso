import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type as domainType } from 'calypso/lib/domains/constants';
import { domainManagementTransfer } from 'calypso/my-sites/domains/paths';
import DomainInfoCard from '..';
import { DomainInfoCardProps } from '../types';

const DomainTransferInfoCard = ( { domain, selectedSite }: DomainInfoCardProps ): JSX.Element => {
	const translate = useTranslate();

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
