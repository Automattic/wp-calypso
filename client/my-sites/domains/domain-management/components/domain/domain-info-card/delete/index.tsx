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
import type { DomainDeleteInfoCardProps, DomainInfoCardProps } from '../types';

const DomainDeleteInfoCard = ( {
	domain,
	selectedSite,
	purchase,
	isLoadingPurchase,
}: DomainDeleteInfoCardProps ): JSX.Element | null => {
	const translate = useTranslate();

	if ( isLoadingPurchase || ! purchase || ! domain.currentUserIsOwner ) return null;

	const removePurchaseClassName = 'domain-delete-info-card is-compact button';

	const title =
		domain.type === domainType.TRANSFER ? translate( 'Cancel transfer' ) : translate( 'Delete' );

	const getDescription = () => {
		switch ( domain.type ) {
			case domainType.SITE_REDIRECT:
				return translate( 'Remove this site redirect permanently' );
			case domainType.MAPPED:
				return translate( 'Remove this domain connection permanently' );
			case domainType.TRANSFER:
				return translate( 'Cancel this domain transfer' );
			default:
				return translate( 'Remove this domain permanently' );
		}
	};

	const removePurchaseRenderedComponent = (
		<RemovePurchase
			hasLoadedSites={ true }
			hasLoadedUserPurchasesFromServer={ true }
			site={ selectedSite }
			purchase={ purchase }
			className={ removePurchaseClassName }
		>
			{ translate( 'Delete' ) }
		</RemovePurchase>
	);

	if ( ! removePurchaseRenderedComponent ) return null;

	return (
		<DomainInfoCard
			type="custom"
			title={ title }
			description={ getDescription() }
			cta={ removePurchaseRenderedComponent }
		/>
	);
};

export default connect( ( state, ownProps: DomainInfoCardProps ) => {
	const { subscriptionId } = ownProps.domain;
	return {
		purchase: getByPurchaseId( state, Number( subscriptionId ) ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
	};
} )( DomainDeleteInfoCard );
