import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Banner } from 'calypso/components/banner/index';
import FormattedHeader from 'calypso/components/formatted-header';
import NavigationHeader from 'calypso/components/navigation-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

import './style.scss';

const DomainUpsellHeader: React.FunctionComponent = () => {
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const translate = useTranslate();
	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);
	const withSkipButton = false;
	const classes = classNames(
		'plans__formatted-header',
		'plans__section-header',
		'modernized-header',
		'header-text',
		{
			'with-skip-button': withSkipButton,
		}
	);

	const onSkipClick = useCallback(
		( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
			event.preventDefault();
			recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
			setShowDomainUpsellDialog( true );
		},
		[ setShowDomainUpsellDialog ]
	);

	return (
		<>
			<FormattedHeader
				className={ classes }
				brandFont
				headerText={ translate( 'Plans' ) }
				subHeaderText={ plansDescription }
				align="left"
			>
				{ withSkipButton && (
					<Button className="plans__section-header-skip-button" onClick={ onSkipClick } href="/">
						{ translate( 'Skip' ) }
						<Gridicon icon="arrow-right" size={ 18 } />
					</Button>
				) }
			</FormattedHeader>
		</>
	);
};

const PlansHeader: React.FunctionComponent< {
	domainFromHomeUpsellFlow?: string;
	subHeaderText?: string;
} > = ( { domainFromHomeUpsellFlow, subHeaderText } ) => {
	const translate = useTranslate();
	const plansDescription =
		subHeaderText ??
		translate( 'See and compare the features available on each WordPress.com plan.' );

	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const cart = useShoppingCart( selectedSiteId! );

	if ( domainFromHomeUpsellFlow ) {
		return <DomainUpsellHeader />;
	}

	async function handleAddCart() {
		await cart.addProductsToCart( [
			{
				product_slug: PLAN_BUSINESS,
			},
			{
				product_slug: 'wordpress_com_1gb_space_addon_yearly',
				quantity: 50,
			},
		] );

		window.location.href = `/checkout/${ selectedSiteSlug }`;
	}

	return (
		<>
			<NavigationHeader
				className="plans__section-header"
				navigationItems={ [] }
				title={ translate( 'Plans' ) }
				subtitle={ plansDescription }
			/>
			<div style={ { paddingLeft: 32 } }>
				<Banner
					title="Bespoke $5/month annual agency Business plan with 100GB storage"
					primaryButton
					callToAction="Buy now"
					onClick={ handleAddCart }
				/>
			</div>
		</>
	);
};

export default PlansHeader;
