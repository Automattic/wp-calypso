/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Button, Icon } from '@wordpress/components';
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
import LoginForm from '../../components/login-form';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';

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

	const [ isDomainFlow, setDomainFlow ] = useState( false );

	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );

	const newSite = useSelect( select => select( SITE_STORE ).getNewSite() );

	const { domain, selectedDesign, siteTitle, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
	const hasSelectedDesign = !! selectedDesign;
	const { createSite, setDomain, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );
	const [ showLoginDialog, setShowLoginDialog ] = useState( false );

	const {
		location: { pathname },
	} = useHistory();
	useEffect( () => {
		// Dialogs usually close naturally when the user clicks the browser's
		// back/forward buttons because their parent is unmounted. However
		// this header isn't unmounted on route changes so we need to
		// explicitly hide the dialog.
		setShowSignupDialog( false );
		setShowLoginDialog( false );
	}, [ pathname, setShowSignupDialog, setShowLoginDialog ] );

	const currentDomain = domain ?? freeDomainSuggestion;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const siteTitleElement = (
		<span className="gutenboarding__site-title">
			{ siteTitle ? siteTitle : NO__( 'Start your website' ) }
		</span>
	);

	const domainElement = (
		<span
			className={ classnames( 'gutenboarding__header-domain-picker-button-domain', {
				placeholder: ! currentDomain,
			} ) }
		>
			{ currentDomain
				? sprintf( NO__( '%s is available' ), currentDomain.domain_name )
				: 'example.wordpress.com' }
		</span>
	);

	const handleCreateSite = useCallback(
		( username: string, bearerToken?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken );
		},
		[ createSite, freeDomainSuggestion ]
	);

	const handleCreateSiteForDomains: typeof handleCreateSite = ( ...args ) => {
		setDomainFlow( true );
		handleCreateSite( ...args );
	};

	const handleSignup = () => {
		setShowSignupDialog( true );
		setShowLoginDialog( false );
	};

	const handleLogin = () => {
		setShowSignupDialog( false );
		setShowLoginDialog( true );
	};

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
		setShowLoginDialog( false );
	};

	const handleSignupForDomains = () => {
		setShowSignupDialog( true );
		setDomainFlow( true );
	};

	useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username ) {
			handleCreateSite( newUser.username, newUser.bearerToken );
		}
	}, [ newUser, handleCreateSite ] );

	useEffect( () => {
		if ( newSite ) {
			if ( isDomainFlow ) {
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
	}, [ domain, isDomainFlow, newSite, resetOnboardStore ] );

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item gutenboarding__header-wp-logo">
					<Icon icon="wordpress-alt" size={ 24 } />
				</div>
				<div className="gutenboarding__header-section-item">{ siteTitleElement }</div>
				<div className="gutenboarding__header-section-item">
					{ siteTitle && (
						<DomainPickerButton
							className="gutenboarding__header-domain-picker-button"
							defaultQuery={ siteTitle }
							disabled={ ! currentDomain }
							currentDomain={ currentDomain }
							onDomainSelect={ setDomain }
							onDomainPurchase={ () =>
								currentUser
									? handleCreateSiteForDomains( currentUser.username )
									: handleSignupForDomains()
							}
							queryParameters={ { vertical: siteVertical?.id } }
						>
							{ domainElement }
						</DomainPickerButton>
					) }
				</div>
			</section>
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item">
					{ hasSelectedDesign && (
						<Button
							className="gutenboarding__header-next-button"
							isPrimary
							isLarge
							onClick={ () =>
								currentUser ? handleCreateSite( currentUser.username ) : handleSignup()
							}
						>
							{ NO__( 'Create my site' ) }
						</Button>
					) }
				</div>
			</section>
			{ showSignupDialog && (
				<SignupForm onRequestClose={ closeAuthDialog } onOpenLogin={ handleLogin } />
			) }
			{ showLoginDialog && (
				<LoginForm
					onRequestClose={ closeAuthDialog }
					onOpenSignup={ handleSignup }
					onLogin={ handleCreateSite }
				/>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Header;
