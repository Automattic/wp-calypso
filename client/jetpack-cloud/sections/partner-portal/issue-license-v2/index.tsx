import { Button } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationItem as NavigationItem,
} from 'calypso/jetpack-cloud/components/layout/nav';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import IssueLicenseContext from './context';
import { useProductBundleSize } from './hooks/use-product-bundle-size';
import useSubmitForm from './hooks/use-submit-form';
import LicensesForm from './licenses-form';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenceProps } from '../types';

import './style.scss';

export default function IssueLicenseV2( { selectedSite, suggestedProduct }: AssignLicenceProps ) {
	const translate = useTranslate();

	const { selectedSize, setSelectedSize, availableSizes } = useProductBundleSize();

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const { isReady } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const [ selectedLicenses, setSelectedLicenses ] = useState< SelectedLicenseProp[] >( [] );

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const handleShowLicenseOverview = useCallback( () => {
		// Handle showing the license overview modal here
	}, [] );

	const onClickIssueLicenses = useCallback( () => {
		handleShowLicenseOverview();
	}, [ handleShowLicenseOverview ] );

	const showStickyContent = isWithinBreakpoint( '>960px' ) && selectedLicenses.length > 0;

	return (
		<Layout
			className="issue-license-v2"
			title={ translate( 'Issue a new License' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<LayoutHeader showStickyContent={ showStickyContent }>
					<Title>{ translate( 'Issue product licenses' ) } </Title>
					<Subtitle>
						{ translate( 'Select single product licenses or save when you issue in bulk' ) }
					</Subtitle>
					<Actions>
						{ selectedLicenses.length > 0 && (
							<Button
								primary
								className="issue-license-v2__select-license"
								busy={ ! isReady }
								onClick={ onClickIssueLicenses }
							>
								{ translate( 'Issue %(numLicenses)d license', 'Issue %(numLicenses)d licenses', {
									context: 'button label',
									count: selectedLicenseCount,
									args: {
										numLicenses: selectedLicenseCount,
									},
								} ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>

				<LayoutNavigation
					selectedText={
						selectedSize === 1
							? translate( 'Single license' )
							: ( translate( '%(size)d licenses', { args: { size: selectedSize } } ) as string )
					}
				>
					{ availableSizes.map( ( size ) => (
						<NavigationItem
							key={ `bundle-size-${ size }` }
							label={
								size === 1
									? translate( 'Single license' )
									: ( translate( '%(size)d licenses', { args: { size } } ) as string )
							}
							selected={ selectedSize === size }
							onClick={ () => setSelectedSize( size ) }
						/>
					) ) }
				</LayoutNavigation>
			</LayoutTop>

			<LayoutBody>
				<IssueLicenseContext.Provider value={ { setSelectedLicenses, selectedLicenses } }>
					<LicensesForm
						selectedSite={ selectedSite }
						suggestedProduct={ suggestedProduct }
						quantity={ selectedSize }
					/>
				</IssueLicenseContext.Provider>
			</LayoutBody>
		</Layout>
	);
}
