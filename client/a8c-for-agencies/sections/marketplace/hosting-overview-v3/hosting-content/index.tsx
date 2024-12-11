import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { SectionProps } from '..';
import { MarketplaceTypeContext } from '../../context';
import EnterpriseAgencyHosting from '../../hosting-overview/hosting-v2/enterprise-agency-hosting';
import PremierAgencyHosting from './premier-agency-hosting';
import StandardAgencyHosting from './standard-agency-hosting';

import './style.scss';

type Props = SectionProps & {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export const HostingContent = ( { section, onAddToCart }: Props ) => {
	const translate = useTranslate();

	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isReferMode = marketplaceType === 'referral';

	const { content, title } = useMemo( () => {
		if ( section === 'wpcom' ) {
			return {
				content: <StandardAgencyHosting />,
				title: isReferMode
					? translate( 'Refer a WordPress.com site to your client' )
					: translate( 'Purchase sites individually or in bulk, as you need them' ),
			};
		}
		if ( section === 'pressable' ) {
			return {
				content: <PremierAgencyHosting />,
				title: isReferMode
					? translate( 'Refer a variety of plans, or single high-resource sites to your clients' )
					: translate(
							'Choose from a variety of plans, or purchase single high-resource sites as add-ons'
					  ),
			};
		}
		if ( section === 'vip' ) {
			return {
				content: <EnterpriseAgencyHosting isReferMode={ isReferMode } />,
				title: translate(
					'Deliver unmatched performance with the highest security standards on our enterprise platform'
				),
			};
		}

		return { content: null, title: '' };
	}, [ isReferMode, onAddToCart, section, translate ] );

	return (
		<div className="hosting-v3__content">
			<h2 className="hosting-v3__content-header">{ title }</h2>
			{ content }
		</div>
	);
};
