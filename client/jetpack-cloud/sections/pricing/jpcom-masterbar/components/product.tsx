import { ExternalLink } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import AIAssistantIcon from '../icons/jetpack-bundle-icon-ai-assistant';
import AntispamIcon from '../icons/jetpack-bundle-icon-antispam';
import BackupIcon from '../icons/jetpack-bundle-icon-backup';
import BlazeIcon from '../icons/jetpack-bundle-icon-blaze';
import BoostIcon from '../icons/jetpack-bundle-icon-boost';
import CRMIcon from '../icons/jetpack-bundle-icon-crm';
import ForAgenciesIcon from '../icons/jetpack-bundle-icon-for-agencies';
import MobileAppIcon from '../icons/jetpack-bundle-icon-mobile-app';
import NewsletterIcon from '../icons/jetpack-bundle-icon-newsletter';
import ScanIcon from '../icons/jetpack-bundle-icon-scan';
import SearchIcon from '../icons/jetpack-bundle-icon-search';
import SocialIcon from '../icons/jetpack-bundle-icon-social';
import StatsIcon from '../icons/jetpack-bundle-icon-stats';
import VideopressIcon from '../icons/jetpack-bundle-icon-videopress';
import { onLinkClick } from '../utils';
import type { FC } from 'react';

interface ProductType {
	product: {
		id: string;
		label: string;
		href: string;
	};
}

const Product: FC< ProductType > = ( { product } ) => {
	const locale = useLocale();
	const { href, label, id } = product;

	const getProductIcon = ( id: string ) => {
		// Convert label to lowercase for case-insensitive matching

		if ( id.includes( 'backup' ) ) {
			return <BackupIcon />;
		}
		if ( id.includes( 'anti-spam' ) ) {
			return <AntispamIcon />;
		}
		if ( id.includes( 'scan' ) ) {
			return <ScanIcon />;
		}
		if ( id.includes( 'search' ) ) {
			return <SearchIcon />;
		}
		if ( id.includes( 'social' ) ) {
			return <SocialIcon />;
		}
		if ( id.includes( 'videopress' ) ) {
			return <VideopressIcon />;
		}
		if ( id.includes( 'crm' ) ) {
			return <CRMIcon />;
		}
		if ( id.includes( 'boost' ) ) {
			return <BoostIcon />;
		}
		if ( id.includes( 'stats' ) ) {
			return <StatsIcon />;
		}
		if ( id.includes( 'newsletter' ) ) {
			return <NewsletterIcon />;
		}
		if ( id.includes( 'mobile' ) ) {
			return <MobileAppIcon />;
		}
		if ( id.includes( 'assistant' ) ) {
			return <AIAssistantIcon />;
		}
		if ( id.includes( 'blaze' ) ) {
			return <BlazeIcon />;
		}
		if ( id.includes( 'agencies' ) || id.includes( 'pro-dashboard' ) ) {
			return <ForAgenciesIcon />;
		}

		return null;
	};

	return (
		<li key={ `submenu-${ href }${ label }` }>
			<ExternalLink
				className="header__submenu-link"
				href={ localizeUrl( href, locale ) }
				onClick={ onLinkClick }
			>
				<span className="jp-product-icon">{ getProductIcon( id ) }</span>
				<span className="header__submenu-label">{ label }</span>
			</ExternalLink>
		</li>
	);
};

export default Product;
