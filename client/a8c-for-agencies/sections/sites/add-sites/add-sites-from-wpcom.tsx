import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, { LayoutHeaderTitle } from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import BaseSiteSelector from 'calypso/components/site-selector';
import './styles.scss';

const AddSitesFromWPCOM = () => {
	const translate = useTranslate();

	const atomicSitesFilter = ( site: SiteDetails ) => site?.is_wpcom_atomic;

	return (
		<LayoutColumn className="add-sites-from-wpcom add-sites-from-wpcom__layout" wide>
			<LayoutTop>
				<LayoutHeader>
					<LayoutHeaderTitle>{ translate( 'Add sites from WordPress.com' ) }</LayoutHeaderTitle>
				</LayoutHeader>
			</LayoutTop>

			<div className="add-sites-from-wpcom__body">
				<BaseSiteSelector
					clasName="add-sites-from-wpcom_site-selector"
					indicator
					allSitesPath="/sites"
					sitesBasePath="/sites"
					onSiteSelect={ () => {} }
					filter={ atomicSitesFilter }
					showHiddenSites={ false }
					showListBottomAdornment={ false }
				/>
			</div>
		</LayoutColumn>
	);
};

export default AddSitesFromWPCOM;
