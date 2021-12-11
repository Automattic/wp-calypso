import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { type as domainType } from 'calypso/lib/domains/constants';
import RemovePurchase from 'calypso/me/purchases/remove-purchase';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import DomainInfoCard from '..';
import { DomainDeleteInfoCardProps, DomainInfoCardProps } from '../types';

const DomainDeleteInfoCard = ( {
	domain,
	selectedSite,
	purchase,
}: DomainDeleteInfoCardProps ): JSX.Element => {
	const translate = useTranslate();
	const removePurchaseClassName = 'is-compact button';

	const title =
		domain.type === domainType.TRANSFER ? translate( 'Cancel transfer' ) : translate( 'Delete' );

	const getDescription = () => {
		switch ( domain.type ) {
			case domainType.MAPPED:
				return translate( 'Remove this domain connection permanently' );
			case domainType.TRANSFER:
				return translate( 'Cancel this domain transfer' );
			default:
				return translate( 'Remove this domain permanently' );
		}
	};

	return (
		<DomainInfoCard
			type="custom"
			title={ title }
			description={ getDescription() }
			cta={
				<RemovePurchase
					hasLoadedSites={ true }
					hasLoadedUserPurchasesFromServer={ true }
					site={ selectedSite }
					purchase={ purchase }
					className={ removePurchaseClassName }
				>
					{ translate( 'Delete' ) }
				</RemovePurchase>
			}
		/>
	);
};

export default connect( ( state, ownProps: DomainInfoCardProps ) => {
	const { subscriptionId } = ownProps.domain;
	return {
		purchase: getByPurchaseId( state, Number( subscriptionId ) )!,
		isLoadingPurchase:
			isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
	};
} )( DomainDeleteInfoCard );
