/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useCallback, useState } from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { SITE_STORE } from '../../stores/site';
import './style.scss';
import DomainPickerButton from '../domain-picker-button';
import SignupForm from '../../components/signup-form';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../../utils/domain-suggestions';
import { PAID_DOMAINS_TO_SHOW } from '../../constants';

import wp from '../../../../lib/wp';

const wpcom = wp.undocumented();

interface Cart {
	blog_id: number;
	cart_key: number;
	coupon: string;
	coupon_discounts: unknown[];
	coupon_discounts_integer: unknown[];
	is_coupon_applied: boolean;
	has_bundle_credit: boolean;
	next_domain_is_free: boolean;
	next_domain_condition: string;
	products: unknown[];
	total_cost: number;
	currency: string;
	total_cost_display: string;
	total_cost_integer: number;
	temporary: boolean;
	tax: unknown;
	sub_total: number;
	sub_total_display: string;
	sub_total_integer: number;
	total_tax: number;
	total_tax_display: string;
	total_tax_integer: number;
	credits: number;
	credits_display: string;
	credits_integer: number;
	allowed_payment_methods: unknown[];
	create_new_blog: boolean;
	messages: Record< 'errors' | 'success', unknown >;
}

const Header: FunctionComponent = () => {
	const { __: NO__ } = useI18n();

	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );

	const newSite = useSelect( select => select( SITE_STORE ).getNewSite() );

	const { domain, siteTitle, siteWasCreatedForDomainPurchase } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);

	const {
		createSite,
		setDomain,
		resetOnboardStore,
		setSiteWasCreatedForDomainPurchase,
	} = useDispatch( ONBOARD_STORE );

	const allSuggestions = useDomainSuggestions( siteTitle );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		PAID_DOMAINS_TO_SHOW
	);
	const freeDomainSuggestion = getFreeDomainSuggestions( allSuggestions )?.[ 0 ];
	const recommendedDomainSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );

	const {
		location: { pathname },
	} = useHistory();
	useEffect( () => {
		// Dialogs usually close naturally when the user clicks the browser's
		// back/forward buttons because their parent is unmounted. However
		// this header isn't unmounted on route changes so we need to
		// explicitly hide the dialog.
		setShowSignupDialog( false );
	}, [ pathname, setShowSignupDialog ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const domainElement = domain ? (
		domain.domain_name
	) : (
		<span
			className={ classnames( 'gutenboarding__header-domain-picker-button-domain', {
				placeholder: ! recommendedDomainSuggestion,
			} ) }
		>
			{ recommendedDomainSuggestion
				? sprintf( NO__( '%s is available' ), recommendedDomainSuggestion.domain_name )
				: 'example.wordpress.com' }
		</span>
	);

	const currentDomain = domain ?? freeDomainSuggestion;

	const handleCreateSite = useCallback(
		( username: string, bearerToken?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken );
		},
		[ createSite, freeDomainSuggestion ]
	);

	const handleCreateSiteForDomains: typeof handleCreateSite = ( ...args ) => {
		setSiteWasCreatedForDomainPurchase( true );
		handleCreateSite( ...args );
	};

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
	};

	const handleSignupForDomains = () => {
		setShowSignupDialog( true );
		setSiteWasCreatedForDomainPurchase( true );
	};

	useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username ) {
			handleCreateSite( newUser.username, newUser.bearerToken );
		}
	}, [ newUser, handleCreateSite ] );

	useEffect( () => {
		if ( newSite ) {
			if ( siteWasCreatedForDomainPurchase ) {
				// I'd rather not make my own product, but this works.
				// lib/cart-items helpers did not perform well.
				const domainProduct = {
					meta: domain?.domain_name,
					product_id: domain?.product_id,
					extra: {
						privacy_available: domain?.supports_privacy,
						privacy: domain?.supports_privacy,
						source: 'gutenboarding',
					},
				};

				const go = async () => {
					const cart: Cart = await wpcom.getCart( newSite.site_slug );
					await wpcom.setCart( newSite.blogid, {
						...cart,
						products: [ ...cart.products, domainProduct ],
					} );

					resetOnboardStore();
					window.location.replace(
						`/checkout/${ newSite.site_slug }?redirect_to=%2Fgutenboarding%2Fdesign`
					);
				};
				go();
				return;
			}
			resetOnboardStore();
			window.location.replace( `/block-editor/page/${ newSite.site_slug }/home?is-gutenboarding` );
		}
	}, [ domain, siteWasCreatedForDomainPurchase, newSite, resetOnboardStore ] );

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="gutenboarding__header-section-item">
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : NO__( 'Start your website' ) }
					</div>
				</div>
				<div className="gutenboarding__header-section-item">
					{ siteTitle && (
						<DomainPickerButton
							className="gutenboarding__header-domain-picker-button"
							disabled={ ! currentDomain }
							currentDomain={ currentDomain }
							onDomainSelect={ setDomain }
							onDomainPurchase={ () =>
								currentUser
									? handleCreateSiteForDomains( currentUser.username )
									: handleSignupForDomains()
							}
						>
							{ domainElement }
						</DomainPickerButton>
					) }
				</div>
			</section>
			{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
		</div>
	);
};

export default Header;
