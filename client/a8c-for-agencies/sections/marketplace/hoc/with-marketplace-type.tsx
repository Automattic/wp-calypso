import { isEnabled } from '@automattic/calypso-config';
import { ComponentType, useState } from 'react';
import useGetTipaltiPayee from '../../referrals/hooks/use-get-tipalti-payee';
import { MarketplaceTypeContext } from '../context';
import { MarketplaceType } from '../types';

type ContextProps = {
	defaultMarketplaceType?: MarketplaceType;
};

export const MARKETPLACE_TYPE_SESSION_STORAGE_KEY = 'marketplace-type';
export const MARKETPLACE_TYPE_REFERRAL = 'referral';
export const MARKETPLACE_TYPE_REGULAR = 'regular';

function withMarketplaceType< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	return ( props ) => {
		const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
		const { data: tipaltiData } = useGetTipaltiPayee( true );
		const isPayable = tipaltiData?.IsPayable;

		const usedMarketplaceType =
			props.defaultMarketplaceType ??
			( sessionStorage.getItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY ) as MarketplaceType ) ??
			MARKETPLACE_TYPE_REGULAR;

		const defaultType =
			isAutomatedReferrals && isPayable ? usedMarketplaceType : MARKETPLACE_TYPE_REGULAR;
		const [ marketplaceType, setMarketplaceType ] = useState( defaultType );

		const updateMarketplaceType = ( type: MarketplaceType ) => {
			sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, type );
			setMarketplaceType( type );
		};

		const toggleMarketplaceType = () => {
			if ( ! isAutomatedReferrals || ! isPayable ) {
				return;
			}
			const nextType =
				marketplaceType === MARKETPLACE_TYPE_REGULAR
					? MARKETPLACE_TYPE_REFERRAL
					: MARKETPLACE_TYPE_REGULAR;
			updateMarketplaceType( nextType );
		};

		return (
			<MarketplaceTypeContext.Provider
				value={ {
					marketplaceType,
					setMarketplaceType: updateMarketplaceType,
					toggleMarketplaceType,
				} }
			>
				<WrappedComponent { ...props } />
			</MarketplaceTypeContext.Provider>
		);
	};
}

export default withMarketplaceType;
