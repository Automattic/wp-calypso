import { isPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, Button, Gridicon } from '@automattic/components';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { stringify } from 'qs';
import React, { useState } from 'react';
import migratingHostImage from 'calypso/assets/images/illustrations/migrating-host-diy.svg';
import themesImage from 'calypso/assets/images/illustrations/themes.svg';
import QueryProducts from 'calypso/components/data/query-products-list';
import HeaderCake from 'calypso/components/header-cake';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';
import {
	getDomainPrice,
	getDomainProductSlug,
	getDomainTransferSalePrice,
} from 'calypso/lib/domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	DOMAINS_WITH_PLANS_ONLY,
	NON_PRIMARY_DOMAINS_TO_FREE_USERS,
} from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const ANALYTICS_SECTION = 'domains';

const PAGE_URL = '/use-your-domain';
function extractBasePath( basePath: string ) {
	return basePath.endsWith( PAGE_URL )
		? basePath.substring( 0, basePath.length - PAGE_URL.length )
		: basePath;
}

type OptionContentProps = {
	image: string;
	title: string;
	reasons: React.ReactNode[];
	onClick: React.MouseEventHandler;
	buttonText: string;
	isPrimary: boolean;
	learnMore: React.ReactNode;
};

function UseYourDomainStepContent( {
	image,
	title,
	reasons,
	onClick,
	buttonText,
	isPrimary,
	learnMore,
}: OptionContentProps ) {
	return (
		<Card className="use-your-domain-step__option" compact>
			<div className="use-your-domain-step__option-inner-wrap">
				<div className="use-your-domain-step__option-content">
					<div className="use-your-domain-step__option-illustration">
						<img src={ image } alt="" />
					</div>
					<h3 className="use-your-domain-step__option-title">{ title }</h3>
					<div className="use-your-domain-step__option-reasons">
						{ reasons.map( ( phrase, index ) => {
							if ( ! phrase ) {
								return;
							}

							return (
								<div className="use-your-domain-step__option-reason" key={ index }>
									<Gridicon icon="checkmark" size={ 18 } />
									{ phrase }
								</div>
							);
						} ) }
					</div>
				</div>
				<div className="use-your-domain-step__option-action">
					<Button
						className="use-your-domain-step__option-button"
						primary={ isPrimary }
						onClick={ onClick }
					>
						{ buttonText }
					</Button>
					<div className="use-your-domain-step__learn-more">{ learnMore }</div>
				</div>
			</div>
		</Card>
	);
}

type UseYourDomainStepProps = {
	basePath: string;
	goBack?: () => void;
	initialQuery?: string;
};

function UseYourDomainStep( { basePath, goBack, initialQuery }: UseYourDomainStepProps ) {
	const cartKey = useCartKey();
	const { responseCart: cart } = useShoppingCart( cartKey );

	const translate = useTranslate();
	const dispatch = useDispatch();
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const [ searchQuery ] = useState( initialQuery || '' );

	const selectedSite = useSelector( getSelectedSite );
	const productsList = useSelector( getProductsList );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const domainsWithPlansOnly = useSelector( ( state ) =>
		currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
	);
	const primaryWithPlansOnly = useSelector( ( state ) =>
		currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);

	const domainsWithPlansOnlyButNoPlan =
		domainsWithPlansOnly && selectedSite?.plan && ! isPlan( selectedSite.plan );
	const productSlug = getDomainProductSlug( searchQuery );
	const domainProductSalePrice = getDomainTransferSalePrice(
		productSlug,
		productsList,
		currencyCode
	);

	let domainProductFreeText = null;
	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, searchQuery ) ) {
		domainProductFreeText = translate( 'Free with your plan' );
	} else if ( domainsWithPlansOnlyButNoPlan ) {
		domainProductFreeText = translate( 'Included in paid plans' );
	}

	let transferSalePriceText = null;
	if (
		domainProductSalePrice !== null &&
		! isNextDomainFree( cart ) &&
		! isDomainBundledWithPlan( cart, searchQuery ) &&
		domainsWithPlansOnlyButNoPlan
	) {
		transferSalePriceText = translate( 'Sale price is %(cost)s', {
			args: { cost: domainProductSalePrice },
		} );
	}

	let transferPriceText = null;
	const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );
	if ( domainProductPrice ) {
		if (
			isNextDomainFree( cart ) ||
			isDomainBundledWithPlan( cart, searchQuery ) ||
			domainsWithPlansOnlyButNoPlan ||
			getDomainTransferSalePrice( productSlug, productsList, currencyCode )
		) {
			transferPriceText = translate( 'Renews at %(cost)s', { args: { cost: domainProductPrice } } );
		} else {
			transferPriceText = translate( '%(cost)s per year', { args: { cost: domainProductPrice } } );
		}
	}

	let mappingPriceText;
	const price = productsList?.domain_map?.cost;
	if ( price && currencyCode ) {
		const cost = formatCurrency( price, currencyCode );
		mappingPriceText = translate(
			'%(cost)s per year plus registration costs at your current provider',
			{ args: { cost } }
		);
	}
	if (
		isDomainMappingFree( selectedSite ) ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, searchQuery )
	) {
		mappingPriceText = translate(
			'Free with your plan, but registration costs at your current provider still apply'
		);
	} else if ( domainsWithPlansOnly || primaryWithPlansOnly ) {
		mappingPriceText = translate(
			'Included in annual paid plans, but registration costs at your current provider still apply'
		);
	}

	const goToMapDomainStep: React.MouseEventHandler = ( event ) => {
		event.preventDefault();

		dispatch(
			recordTracksEvent( 'calypso_use_your_domain_mapping_click', {
				domain_name: ANALYTICS_SECTION,
			} )
		);

		const basePathForMapping = extractBasePath( basePath );
		let mapDomainStepURL = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			const query = stringify( { initialQuery: searchQuery.trim() } );
			mapDomainStepURL += `/${ selectedSite.slug }?${ query }`;
		}

		page( mapDomainStepURL );
	};

	const goToTransferDomainStep: React.MouseEventHandler = ( event ) => {
		event.preventDefault();

		dispatch(
			recordTracksEvent( 'calypso_use_your_domain_transfer_click', {
				domain_name: ANALYTICS_SECTION,
			} )
		);

		const basePathForTransfer = extractBasePath( basePath );
		let transferDomainStepURL = `${ basePathForTransfer }/transfer`;
		if ( selectedSite ) {
			const query = stringify( {
				initialQuery: searchQuery.trim(),
				useStandardBack: true,
			} );
			transferDomainStepURL += `/${ selectedSite.slug }?${ query }`;
		}

		page( transferDomainStepURL );
	};

	return (
		<div className="use-your-domain-step">
			<HeaderCake onClick={ goBack }>{ translate( 'Use My Own Domain' ) }</HeaderCake>
			<QueryProducts />
			<div className="use-your-domain-step__content">
				<UseYourDomainStepContent
					image={ migratingHostImage }
					title={ translate( 'Transfer your domain away from your current registrar.' ) }
					reasons={ [
						translate(
							'Domain registration and billing will be moved from your current provider to WordPress.com'
						),
						translate( 'Manage your domain and site from your WordPress.com dashboard' ),
						translate( 'Extends registration by one year' ),
						domainProductFreeText,
						transferSalePriceText,
						transferPriceText,
					] }
					buttonText={ translate( 'Transfer to WordPress.com' ) }
					onClick={ goToTransferDomainStep }
					isPrimary
					learnMore={ translate( '{{a}}Learn more about domain transfers{{/a}}', {
						components: {
							a: (
								<a
									href={ localizeUrl( INCOMING_DOMAIN_TRANSFER ) }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
					} ) }
				/>
				<UseYourDomainStepContent
					image={ themesImage }
					title={ translate( 'Map your domain without moving it from your current registrar.' ) }
					reasons={ [
						translate( 'Domain registration and billing will remain at your current provider' ),
						translate(
							'Manage some domain settings at your current provider and some at WordPress.com'
						),
						translate( "Requires changes to the domain's DNS" ),
						mappingPriceText,
					] }
					buttonText={ translate( 'Map your domain' ) }
					onClick={ goToMapDomainStep }
					isPrimary={ false }
					learnMore={ translate( '{{a}}Learn more about domain mapping{{/a}}', {
						components: {
							a: (
								<a
									href={ localizeUrl( MAP_EXISTING_DOMAIN ) }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
					} ) }
				/>
			</div>
			<p className="use-your-domain-step__footer">
				{ translate( "Not sure what works best for you? {{a}}We're happy to help!{{/a}}", {
					components: {
						a: <button onClick={ () => setShowHelpCenter( true ) } />,
					},
				} ) }
			</p>
		</div>
	);
}

export default UseYourDomainStep;
