import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import AssignLicenseStepProgress from '../assign-license-step-progress';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenceProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export default function IssueLicense( { siteId }: AssignLicenceProps ) {
	const translate = useTranslate();

	const [ selectedLicenses ] = useState< SelectedLicenseProp[] >( [] );
	const [ showReviewLicenses ] = useState< boolean >( false );

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const sites = useSelector( getSites );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedLicenses.length > 0;

	const currentStep = showReviewLicenses ? 'reviewLicense' : 'issueLicense';

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	const subtitle = useMemo( () => {
		if ( selectedSite?.domain ) {
			return translate(
				'Select the products you would like to add to {{strong}}%(selectedSiteDomain)s{{/strong}}:',
				{
					args: { selectedSiteDomain: selectedSite.domain },
					components: { strong: <strong /> },
				}
			);
		}

		return translate( 'Select the products you would like to issue a new license for:' );
	}, [ selectedSite?.domain, translate ] );

	return (
		<Layout
			className={ classNames( 'issue-license' ) }
			title={ translate( 'Issue a new License' ) }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<AssignLicenseStepProgress
					currentStep={ currentStep }
					selectedSite={ selectedSite }
					isBundleLicensing
				/>

				<LayoutHeader showStickyContent={ showStickyContent }>
					<Title>{ translate( 'Issue product licenses' ) } </Title>
					<Subtitle>{ subtitle }</Subtitle>
				</LayoutHeader>
			</LayoutTop>
		</Layout>
	);
}
