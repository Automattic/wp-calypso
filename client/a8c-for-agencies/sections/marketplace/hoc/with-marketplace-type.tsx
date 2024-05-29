import { isEnabled } from '@automattic/calypso-config';
import React, { ComponentType, useState } from 'react';
import { MarketplaceTypeContext } from '../context';
import { MarketplaceType } from '../types';

type ContextProps = {
	defaultMarketplaceType?: MarketplaceType;
};

const MARKETPLACE_TYPE_SESSION_STORAGE_KEY = 'marketplace-type';

function withMarketplaceType< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	return ( props ) => {
		const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
		const usedMarketplaceType =
			props.defaultMarketplaceType ??
			( sessionStorage.getItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY ) as MarketplaceType ) ??
			'regular';

		const defaultType = isAutomatedReferrals ? usedMarketplaceType : 'regular';
		const [ marketplaceType, setMarketplaceType ] = useState( defaultType );

		const updateMarketplaceType = ( type: MarketplaceType ) => {
			sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, type );
			setMarketplaceType( type );
		};

		const toggleMarketplaceType = () => {
			if ( ! isAutomatedReferrals ) {
				return;
			}
			const nextType = marketplaceType === 'regular' ? 'referral' : 'regular';
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
