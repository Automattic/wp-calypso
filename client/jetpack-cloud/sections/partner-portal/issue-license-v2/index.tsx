import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
import IssueMultipleLicensesForm from 'calypso/jetpack-cloud/sections/partner-portal/issue-multiple-licenses-form';
import IssueLicenseContext from './context';
import { useProductBundleSize } from './hooks/use-product-bundle-size';
import type { SelectedLicenseProp } from './types';
import type { AssignLicenceProps } from '../types';

export default function IssueLicenseV2( { selectedSite, suggestedProduct }: AssignLicenceProps ) {
	const translate = useTranslate();

	const { selectedSize, setSelectedSize, availableSizes } = useProductBundleSize();
	const [ selectedLicenses, setSelectedLicenses ] = useState< SelectedLicenseProp[] >( [] );

	return (
		<Layout
			className="issue-license-v2"
			title={ translate( 'Issue a new License' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Issue product licenses' ) } </Title>
					<Subtitle>
						{ translate( 'Select single product licenses or save when you issue in bulk' ) }
					</Subtitle>

					<Actions>
						<Button primary>Issue license </Button>
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
					<IssueMultipleLicensesForm
						selectedSite={ selectedSite }
						suggestedProduct={ suggestedProduct }
						quantity={ selectedSize }
					/>
				</IssueLicenseContext.Provider>
			</LayoutBody>
		</Layout>
	);
}
