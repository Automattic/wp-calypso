import { useContext, useMemo } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { SectionProps } from '..';
import { MarketplaceTypeContext } from '../../context';
import EnterpriseAgencyHosting from './enterprise-agency-hosting';
import PremierAgencyHosting from './premier-agency-hosting';
import StandardAgencyHosting from './standard-agency-hosting';

type Props = SectionProps & {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export const HostingContent = ( { section, onAddToCart }: Props ) => {
	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isReferMode = marketplaceType === 'referral';

	const { content } = useMemo( () => {
		if ( section === 'wpcom' ) {
			return {
				content: <StandardAgencyHosting onAddToCart={ onAddToCart } />,
			};
		}
		if ( section === 'pressable' ) {
			return {
				content: <PremierAgencyHosting onAddToCart={ onAddToCart } />,
			};
		}
		if ( section === 'vip' ) {
			return {
				content: <EnterpriseAgencyHosting isReferMode={ isReferMode } />,
			};
		}

		return { content: null, title: '' };
	}, [ isReferMode, onAddToCart, section ] );

	return <div className="hosting__content">{ content }</div>;
};
