import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
// FIX ME: Lets decide later if we need to move this hook to a shared common folder.
import { useProductBundleSize } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';
import AssignLicenseStepProgress from '../assign-license-step-progress';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenceProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export default function IssueLicense( { siteId }: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedSize, setSelectedSize, availableSizes } = useProductBundleSize( true );

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

	const selectedText =
		selectedSize === 1
			? translate( 'Single license' )
			: ( translate( '%(size)d licenses', { args: { size: selectedSize } } ) as string );

	const selectedCount = selectedLicenses.filter( ( license ) => license.quantity === selectedSize )
		?.length;

	const navItems = availableSizes.map( ( size ) => {
		const count = selectedLicenses.filter( ( license ) => license.quantity === size ).length;
		return {
			label:
				size === 1
					? translate( 'Single license' )
					: ( translate( '%(size)d licenses', {
							args: { size },
					  } ) as string ),
			selected: selectedSize === size,
			onClick: () => {
				setSelectedSize( size );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_bundle_tab_click', {
						bundle_size: size,
					} )
				);
			},
			...( count && { count } ),
		};
	} );

	const selectedItemProps = {
		selectedText,
		...( selectedCount && { selectedCount } ),
	};

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

				<LayoutNavigation { ...selectedItemProps }>
					<LayoutNavigationTabs { ...selectedItemProps } items={ navItems } />
				</LayoutNavigation>
			</LayoutTop>
		</Layout>
	);
}
