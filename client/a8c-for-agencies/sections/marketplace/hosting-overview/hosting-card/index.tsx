import {
	Badge,
	BloombergLogo,
	Button,
	CNNLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	Gridicon,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
	Tooltip,
} from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { debounce } from '@wordpress/compose';
import { Icon, external, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { MarketplaceTypeContext } from '../../context';
import { getHostingLogo, getHostingPageUrl } from '../../lib/hosting';
import useHostingDescription from '../hooks/use-hosting-description';

import './style.scss';

type Props = {
	plan: APIProductFamilyProduct;
	pressableOwnership?: 'regular' | 'agency' | 'none';
	highestDiscountPercentage?: number;
	className?: string;
	/** The minimum height for the pricing section. */
	minPriceHeight?: number;
	/** Callback to sync the card's pricing section height with others. */
	setPriceHeight?: ( height: number ) => void;
};

export default function HostingCard( {
	plan,
	pressableOwnership = 'none',
	highestDiscountPercentage,
	className,
	minPriceHeight,
	setPriceHeight,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showTooltip, setShowTooltip ] = useState( false );

	//FIXME: We want to unify and refactor this logic, once we decide
	//on how the UX should look in the end
	const pressableUrl = 'https://my.pressable.com/agency/auth';

	const { name, heading, description, features, footerText } = useHostingDescription(
		plan.family_slug
	);

	const priceRef = useRef< HTMLDivElement >( null );
	const tooltip = useRef< HTMLDivElement >( null );
	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const shouldShowDiscount = !! highestDiscountPercentage && marketplaceType !== 'referral';

	const onExploreClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_marketplace_hosting_overview_explore_plan_click', {
				hosting: plan.family_slug,
			} )
		);
	}, [ dispatch, plan.family_slug ] );

	const onVipDemoClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_marketplace_hosting_overview_request_vip_demo_click' ) );
	}, [ dispatch ] );

	const priceStartingAt = useMemo< string >( () => {
		// If the amount is not a number, we assume it's a string that should be displayed as is.
		if ( plan.amount && isNaN( Number( plan.amount ) ) ) {
			return plan.amount;
		}

		return formatCurrency( Number( plan.amount ), plan.currency );
	}, [ plan.amount, plan.currency ] );

	const priceIntervalDescription = useMemo< string >( () => {
		if ( plan.price_interval === 'day' ) {
			return translate( 'per plan per day' );
		}

		if ( plan.price_interval === 'month' ) {
			return translate( 'per plan per month' );
		}

		return translate( 'USD' );
	}, [ plan.price_interval, translate ] );

	// Call `setPriceHeight` when the component mounts and when the window is resized,
	// to keep the height of the card consistent with others.
	useEffect( () => {
		const handleResize = debounce( () => {
			if ( priceRef.current && setPriceHeight ) {
				setPriceHeight( priceRef.current.clientHeight );
			}
		}, 100 );

		// Set the initial height when the component mounts.
		handleResize();
		// Update the height when the window is resized.
		window.addEventListener( 'resize', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ setPriceHeight ] );

	const exploreButton = useMemo( () => {
		if ( pressableOwnership === 'regular' ) {
			return (
				<Button
					className="hosting-card__pressable-dashboard-button"
					target="_blank"
					rel="norefferer nooppener"
					href={ pressableUrl }
				>
					{ translate( 'Manage in Pressable' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
			);
		}

		if ( plan.family_slug === 'vip' ) {
			return (
				<Button
					href={ getHostingPageUrl( plan.family_slug ) }
					target="_blank"
					onClick={ onVipDemoClick }
					primary
				>
					<span className="hosting-card__explore-button-content">
						{ translate( 'Request a Demo' ) }
						<Gridicon icon="external" />
					</span>
				</Button>
			);
		}

		return (
			<Button
				className="hosting-card__explore-button"
				href={ getHostingPageUrl( plan.family_slug ) }
				onClick={ onExploreClick }
				primary
			>
				{ translate( 'Explore %(hosting)s', {
					args: {
						hosting: name,
					},
					comment: '%(hosting)s is the name of the hosting provider.',
				} ) }
			</Button>
		);
	}, [ name, onExploreClick, onVipDemoClick, plan.family_slug, pressableOwnership, translate ] );

	return (
		<div className={ clsx( 'hosting-card', className ) }>
			<div className="hosting-card__section">
				<div className="hosting-card__heading">{ heading }</div>

				{ pressableOwnership !== 'none' && (
					<>
						{
							// Show the check icon and tooltip only on desktop
							<>
								<Icon
									onMouseEnter={ () => setShowTooltip( true ) }
									onMouseLeave={ () => setShowTooltip( false ) }
									onMouseDown={ () => setShowTooltip( false ) }
									onTouchStart={ () => setShowTooltip( true ) }
									role="button"
									tabIndex={ 0 }
									ref={ tooltip }
									className="hosting-card__check-icon"
									icon={ check }
									size={ 18 }
								/>
								<Tooltip
									className="gray-tooltip"
									context={ tooltip.current }
									isVisible={ showTooltip }
									position="bottom"
								>
									{ translate( 'You own this' ) }
								</Tooltip>
							</>
						}
						{
							// Show the badge only on mobile
							<Badge className="hosting-card__ownership-badge" type="success">
								{ translate( 'You own this' ) }
							</Badge>
						}
					</>
				) }

				<p className="hosting-card__description">{ description }</p>

				{ plan.family_slug === 'vip' ? (
					<div className="hosting-card__section hosting-card__logo-section">
						<div className="hosting-card__logos">
							<TimeLogo />
							<SlackLogo />
							<DisneyLogo />
							<CondenastLogo />
							<BloombergLogo />
							<CNNLogo />
							<SalesforceLogo />
							<FacebookLogo />
						</div>
					</div>
				) : (
					<div
						className="hosting-card__price"
						ref={ priceRef }
						style={ { minHeight: `${ minPriceHeight }px` } }
					>
						<div>
							<div className="hosting-card__price-value">
								{ translate( 'Starting at %(priceStartingAt)s', {
									args: { priceStartingAt },
								} ) }
							</div>
							<div className="hosting-card__price-interval">{ priceIntervalDescription }</div>
						</div>
						{ shouldShowDiscount ? (
							<div className="hosting-card__price-discount">
								{ translate( 'Volume savings up to %(highestDiscountPercentage)s%%', {
									args: { highestDiscountPercentage: Math.trunc( highestDiscountPercentage ) },
								} ) }
							</div>
						) : null }
					</div>
				) }

				{ exploreButton }
			</div>

			{ features.length > 0 && (
				<div className="hosting-card__section hosting-card__feature-section">
					<SimpleList items={ features } />
				</div>
			) }

			<div className="hosting-card__footer">
				<span>{ footerText }</span>
				{ getHostingLogo( plan.family_slug, false ) }
			</div>
		</div>
	);
}
