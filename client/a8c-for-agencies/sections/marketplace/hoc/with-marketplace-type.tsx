import React, { ComponentType, useState } from 'react';
import { MarketplaceTypeContext } from '../context';
import { MarketplaceType } from '../types';

type ContextProps = {
	defaultMarketplaceType: MarketplaceType;
};

function withMarketplaceType< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	return ( props ) => {
		const [ marketplaceType, setMarketplaceType ] = useState( props.defaultMarketplaceType );

		return (
			<MarketplaceTypeContext.Provider value={ { marketplaceType, setMarketplaceType } }>
				<WrappedComponent { ...props } />
			</MarketplaceTypeContext.Provider>
		);
	};
}

export default withMarketplaceType;
