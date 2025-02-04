import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { transferStatus, type as domainType } from 'calypso/lib/domains/constants';
import { isCancelable, isRemovable } from 'calypso/lib/purchases';
import { cancelPurchase } from 'calypso/me/purchases/paths';
import RemovePurchase from 'calypso/me/purchases/remove-purchase';
import { getCancelPurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { IAppState } from 'calypso/state/types';
import DomainInfoCard from '..';
import type { DomainDeleteInfoCardProps, DomainInfoCardProps } from '../types';

const DomainDeleteInfoCard = ( {
	domain,
	selectedSite,
	purchase,
	isLoadingPurchase,
}: DomainDeleteInfoCardProps ) => {
	const translate = useTranslate();

	if (
		isLoadingPurchase ||
		! purchase ||
		! domain.currentUserIsOwner ||
		domain.pendingRegistration ||
		domain.isMoveToNewSitePending ||
		domain.transferStatus === transferStatus.PENDING_ASYNC
	) {
		return null;
	}

	const removePurchaseClassName = 'domain-delete-info-card is-compact button';

	const title =
		domain.type === domainType.TRANSFER ? translate( 'Cancel transfer' ) : translate( 'Delete' );

	const buttonLabel =
		domain.type === domainType.TRANSFER ? translate( 'Cancel' ) : translate( 'Delete' );

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
			hasLoadedSites
			hasLoadedUserPurchasesFromServer
			site={ selectedSite }
			purchase={ purchase }
			className={ removePurchaseClassName }
		>
			{ buttonLabel }
		</RemovePurchase>
	);

	if ( isRemovable( purchase ) ) {
		return (
			<DomainInfoCard
				type="custom"
				title={ title }
				description={ getDescription() }
				cta={ removePurchaseRenderedComponent }
			/>
		);
	}

	if ( ! isCancelable( purchase ) ) {
		return null;
	}

	const link = config.isEnabled( 'calypso/all-domain-management' )
		? cancelPurchase( selectedSite.slug, purchase.id )
		: getCancelPurchaseUrlFor( selectedSite.slug, purchase.id );

	return (
		<DomainInfoCard
			type="href"
			ctaText={ translate( 'Delete' ) }
			title={ title }
			description={ getDescription() }
			href={ link }
		/>
	);
};

export default connect( ( state: IAppState, ownProps: DomainInfoCardProps ) => {
	const { subscriptionId } = ownProps.domain;
	return {
		purchase: getByPurchaseId( state, Number( subscriptionId ) ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
	};
} )( DomainDeleteInfoCard );
