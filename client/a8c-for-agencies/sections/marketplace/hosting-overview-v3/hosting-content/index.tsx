import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import VIPLogo from 'calypso/assets/images/a8c-for-agencies/vip-full-logo.svg';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { SectionProps } from '..';
import { MarketplaceTypeContext } from '../../context';
import EnterpriseAgencyHosting from '../../hosting-overview/hosting-v2/enterprise-agency-hosting';
import PremierAgencyHosting from '../../hosting-overview/hosting-v2/premier-agency-hosting';
import StandardAgencyHosting from '../../hosting-overview/hosting-v2/standard-agency-hosting';

import './style.scss';

type Props = SectionProps & {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export const HostingContent = ( { section, onAddToCart }: Props ) => {
	const translate = useTranslate();

	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isReferMode = marketplaceType === 'referral';

	let content;
	let logo;
	let title;
	if ( section === 'wpcom' ) {
		content = <StandardAgencyHosting onAddToCart={ onAddToCart } />;
		logo = <img src={ WPCOMLogo } alt="WPCOM" />;
		title = translate(
			'Optimized and hassle-free hosting for business websites, local merchants, and small online retailers.'
		);
	}
	if ( section === 'pressable' ) {
		content = <PremierAgencyHosting onAddToCart={ ( product ) => onAddToCart( product, 1 ) } />;
		logo = <img src={ PressableLogo } alt="Pressable" />;
		title = translate(
			'Premier Agency hosting best for large-scale businesses and major eCommerce sites.'
		);
	}
	if ( section === 'vip' ) {
		content = <EnterpriseAgencyHosting isReferMode={ isReferMode } />;
		logo = <img src={ VIPLogo } alt="VIP" />;
		title = translate(
			'Deliver unmatched performance with the highest security standards on our enterprise content platform.'
		);
	}
	return (
		<div className="hosting-v3__content">
			<div className="hosting-v3__content-header">
				<div className="hosting-v3__content-logo">{ logo }</div>
				<div className="hosting-v3__content-header-title">{ title }</div>
			</div>
			{ content }
		</div>
	);
};
