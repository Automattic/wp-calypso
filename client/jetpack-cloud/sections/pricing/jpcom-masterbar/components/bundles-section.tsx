import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import { Fragment } from 'react';
import ExternalLink from 'calypso/components/external-link';
import AntispamIcon from '../icons/jetpack-bundle-icon-antispam';
import BackupIcon from '../icons/jetpack-bundle-icon-backup';
import BoostIcon from '../icons/jetpack-bundle-icon-boost';
import CRMIcon from '../icons/jetpack-bundle-icon-crm';
import ScanIcon from '../icons/jetpack-bundle-icon-scan';
import SearchIcon from '../icons/jetpack-bundle-icon-search';
import SocialIcon from '../icons/jetpack-bundle-icon-social';
import VideopressIcon from '../icons/jetpack-bundle-icon-videopress';
import { onLinkClick, sortByMenuOrder } from '../utils';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { FC, MouseEvent } from 'react';

interface BundlesSectionProps {
	bundles: MenuItem | null;
}

const BundlesSection: FC< BundlesSectionProps > = ( { bundles } ) => {
	const locale = useLocale();

	if ( ! bundles || Array( bundles.items ).length < 1 ) {
		return null;
	}

	const getBundleIcons = ( bundle: string ) => {
		// Using a soft match in case the menu item gets deleted and recreated in wp-admin
		// causing the name to change to `complete-2` or something similar.
		if ( bundle.includes( 'complete' ) ) {
			return [
				<BackupIcon />,
				<AntispamIcon />,
				<ScanIcon />,
				<SearchIcon />,
				<SocialIcon />,
				<VideopressIcon />,
				<CRMIcon />,
				<BoostIcon />,
			];
		}

		if ( bundle.includes( 'security' ) ) {
			return [ <BackupIcon />, <AntispamIcon />, <ScanIcon /> ];
		}

		return [];
	};

	const onBundlesLinkClick = ( e: MouseEvent< HTMLAnchorElement > ) => {
		onLinkClick( e, 'calypso_jetpack_nav_bundles_click' );
	};

	return (
		<div className="header__submenu-bottom-section">
			<div className="header__submenu-bundles">
				<p className="header__submenu-category-heading">{ bundles.label }</p>

				<ul className="header__submenu-links-list">
					{ bundles &&
						Array.from( Object.values( bundles.items ) )
							.sort( sortByMenuOrder )
							.map( ( { id, label, href } ) => (
								<li key={ `bundles-${ href }-${ label }` }>
									<ExternalLink
										className="header__submenu-link"
										href={ localizeUrl( href, locale ) }
										onClick={ onBundlesLinkClick }
									>
										<p className="header__submenu-label">
											<span>{ label }</span>
										</p>
										<div className="header__submenu-bundle-icons">
											{ getBundleIcons( id ).map( ( icon, index ) => (
												<Fragment key={ `bundle-icon-${ id }${ index }` }>{ icon }</Fragment>
											) ) }
										</div>
									</ExternalLink>
								</li>
							) ) }
				</ul>
			</div>
		</div>
	);
};

export default BundlesSection;
