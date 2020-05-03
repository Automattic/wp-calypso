/**
 * External dependencies
 */
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
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
import PlansButton from '../plans-button';
import SignupForm from '../../components/signup-form';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../../utils/domain-suggestions';
import { PAID_DOMAINS_TO_SHOW } from '../../constants';
import { usePath, useCurrentStep, Step } from '../../path';
import wp from '../../../../lib/wp';
import { recordOnboardingComplete } from '../../lib/analytics';

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

const Header: React.FunctionComponent = () => {
	const { __, i18nLocale } = useI18n();

	const currentStep = useCurrentStep();

	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );

	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );

	const { domain, siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );

	const makePath = usePath();

	const { createSite, setDomain, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const allSuggestions = useDomainSuggestions( { searchOverride: siteTitle, locale: i18nLocale } );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		PAID_DOMAINS_TO_SHOW
	);
	const freeDomainSuggestion = getFreeDomainSuggestions( allSuggestions )?.[ 0 ];
	const recommendedDomainSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	React.useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	const [ showSignupDialog, setShowSignupDialog ] = React.useState( false );
	const [ isRedirecting, setIsRedirecting ] = React.useState( false );

	const {
		location: { pathname, search },
		push,
	} = useHistory();

	React.useEffect( () => {
		// This handles opening the signup modal when there is a ?signup query parameter
		// then removes the parameter.
		// The use case is a user clicking "Create account" from login
		// TODO: We can remove this condition when we've converted signup into it's own page
		if ( ! showSignupDialog && new URLSearchParams( search ).has( 'signup' ) ) {
			setShowSignupDialog( true );
			push( makePath( Step[ currentStep ] ) );
		} else {
			// Dialogs usually close naturally when the user clicks the browser's
			// back/forward buttons because their parent is unmounted. However
			// this header isn't unmounted on route changes so we need to
			// explicitly hide the dialog.
			setShowSignupDialog( false );
		}
	}, [ pathname, setShowSignupDialog ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const isMobile = useViewportMatch( 'mobile', '<' );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const domainElement = domain ? (
		domain.domain_name
	) : (
		<span
			className={ classnames( 'gutenboarding__header-domain-picker-button-domain', {
				placeholder: ! recommendedDomainSuggestion,
			} ) }
		>
			{ isMobile && __( 'Domain available' ) }
			{ ! isMobile &&
				( recommendedDomainSuggestion
					? /* translators: domain name is available, eg: "yourname.com is available" */
					  sprintf( __( '%s is available' ), recommendedDomainSuggestion.domain_name )
					: 'example.wordpress.com' ) }
		</span>
	);

	const handleCreateSite = React.useCallback(
		( username: string, bearerToken?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken );
		},
		[ createSite, freeDomainSuggestion ]
	);

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
	};

	React.useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username ) {
			handleCreateSite( newUser.username, newUser.bearerToken );
		}
	}, [ newUser, handleCreateSite ] );

	React.useEffect( () => {
		// isRedirecting check this is needed to make sure we don't overwrite the first window.location.replace() call
		if ( newSite && ! isRedirecting ) {
			if ( hasPaidDomain ) {
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
					setIsRedirecting( true );
					resetOnboardStore();
					window.location.replace( `/start/prelaunch?siteSlug=${ newSite.blogid }` );
				};
				go();
				return;
			}

			recordOnboardingComplete( {
				isNewSite: !! newSite,
				isNewUser: !! newUser,
				blogId: newSite.blogid,
			} );

			setIsRedirecting( true );
			resetOnboardStore();

			window.location.replace( `/block-editor/page/${ newSite.site_slug }/home` );
		}
	}, [ domain, newSite, newUser, resetOnboardStore, isRedirecting, hasPaidDomain ] );

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
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
						{ siteTitle ? siteTitle : __( 'Start your website' ) }
					</div>
				</div>
				<div className="gutenboarding__header-section-item">
					{
						// We display the DomainPickerButton as soon as we have a domain suggestion,
						// unless we're still at the IntentGathering step. In that case, we only
						// show it comes from a site title (but hide it if it comes from a vertical).
						domainElement && ( siteTitle || currentStep !== 'IntentGathering' ) && (
							<DomainPickerButton
								className="gutenboarding__header-domain-picker-button"
								currentDomain={ domain }
								onDomainSelect={ setDomain }
							>
								{ domainElement }
							</DomainPickerButton>
						)
					}
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-section-item--right">
					<PlansButton />
				</div>
			</section>
			{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
		</div>
	);
};

export default Header;
