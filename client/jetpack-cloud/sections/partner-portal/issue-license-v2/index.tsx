import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
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
	LayoutNavigationTabs as NavigationTabs,
} from 'calypso/jetpack-cloud/components/layout/nav';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import AssignLicenseStepProgress from '../assign-license-step-progress';
import IssueLicenseContext from './context';
import { useProductBundleSize } from './hooks/use-product-bundle-size';
import useSubmitForm from './hooks/use-submit-form';
import LicensesForm from './licenses-form';
import ReviewLicenses from './review-licenses';
import TotalCost from './total-cost';
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
	const [ showReviewLicenses, setShowReviewLicenses ] = useState< boolean >( false );

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const handleShowLicenseOverview = useCallback( () => {
		setShowReviewLicenses( true );
	}, [] );

	const onClickIssueLicenses = useCallback( () => {
		handleShowLicenseOverview();
	}, [ handleShowLicenseOverview ] );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedLicenses.length > 0;

	// Group licenses by slug and sort them by quantity
	const getGroupedLicenses = useCallback( () => {
		return Object.values(
			selectedLicenses.reduce(
				( acc: Record< string, SelectedLicenseProp[] >, license ) => (
					( acc[ license.slug ] = ( acc[ license.slug ] || [] ).concat( license ) ), acc
				),
				{}
			)
		)
			.map( ( group ) => group.sort( ( a, b ) => a.quantity - b.quantity ) )
			.flat();
	}, [ selectedLicenses ] );

	const currentStep = showReviewLicenses ? 'reviewLicense' : 'issueLicense';

	const selectedText =
		selectedSize === 1
			? translate( 'Single license' )
			: ( translate( '%(size)d licenses', { args: { size: selectedSize } } ) as string );

	return (
		<>
			<Layout
				className="issue-license-v2"
				title={ translate( 'Issue a new License' ) }
				wide
				withBorder
			>
				<LayoutTop>
					<AssignLicenseStepProgress currentStep={ currentStep } isBundleLicensing />

					<LayoutHeader showStickyContent={ showStickyContent }>
						<Title>{ translate( 'Issue product licenses' ) } </Title>
						<Subtitle>
							{ translate( 'Select single product licenses or save when you issue in bulk' ) }
						</Subtitle>
						{ selectedLicenses.length > 0 && (
							<Actions>
								<div className="issue-license-v2__controls">
									<div className="issue-license-v2__actions">
										<TotalCost selectedLicenses={ selectedLicenses } />
										<Button
											primary
											className="issue-license-v2__select-license"
											busy={ ! isReady }
											onClick={ onClickIssueLicenses }
										>
											{ translate(
												'Review %(numLicenses)d license',
												'Review %(numLicenses)d licenses',
												{
													context: 'button label',
													count: selectedLicenseCount,
													args: {
														numLicenses: selectedLicenseCount,
													},
												}
											) }
										</Button>
									</div>
								</div>
							</Actions>
						) }
					</LayoutHeader>

					<LayoutNavigation selectedText={ selectedText }>
						<NavigationTabs
							selectedText={ selectedText }
							items={ availableSizes.map( ( size ) => ( {
								label:
									size === 1
										? translate( 'Single license' )
										: ( translate( '%(size)d licenses', {
												args: { size },
										  } ) as string ),
								selected: selectedSize === size,
								onClick: () => setSelectedSize( size ),
							} ) ) }
						/>
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
			{ showReviewLicenses && (
				<ReviewLicenses
					onClose={ () => setShowReviewLicenses( false ) }
					selectedLicenses={ getGroupedLicenses() }
				/>
			) }
		</>
	);
}
