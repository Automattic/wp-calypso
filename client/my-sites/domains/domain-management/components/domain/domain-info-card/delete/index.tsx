import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import RemovePurchase from 'calypso/me/purchases/remove-purchase';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import DomainInfoCard from '..';
import { DomainDeleteInfoCardProps, DomainInfoCardProps } from '../types';

const DomainDeleteInfoCard = ( {
	selectedSite,
	purchase,
}: DomainDeleteInfoCardProps ): JSX.Element => {
	const translate = useTranslate();
	const removePurchaseClassName = 'is-compact button';

	return (
		<DomainInfoCard
			type="custom"
			title={ translate( 'Delete' ) }
			description={ translate( 'Remove this domain permanently' ) }
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
