import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import AllSites from 'calypso/blocks/all-sites';
import Site from 'calypso/blocks/site';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import JetpackLogo from './jetpack-logo.svg';

type Props = {
	selectedSiteId?: number | string;
};

const AllSitesIcon = () => (
	<img
		className="jetpack-cloud-sidebar__all-sites-icon"
		src={ JetpackLogo }
		alt=""
		role="presentation"
	/>
);

const Header = ( { selectedSiteId }: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onSelectSite = useCallback( () => {
		dispatch( setLayoutFocus( 'sites' ) );
	}, [ dispatch ] );

	return (
		<div className="jetpack-cloud-sidebar__header">
			{ selectedSiteId ? (
				<Site className="jetpack-cloud-sidebar__selected-site" />
			) : (
				<AllSites
					showIcon
					showCount={ false }
					icon={ <AllSitesIcon /> }
					title={ translate( 'All Sites' ) }
					onSelect={ onSelectSite }
				/>
			) }
		</div>
	);
};

export default Header;
