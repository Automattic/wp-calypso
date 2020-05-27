/**
 * WordPress dependencies
 */
import { useEffect, useState, useRef } from '@wordpress/element';
import {
	Placeholder,
	Button,
	ExternalLink,
	withNotices,
	Spinner,
	Notice,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { addQueryArgs, getQueryArg, isURL } from '@wordpress/url';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import Tabs from './tabs';
import Blocks from './blocks';
import Controls from './controls';
import Inspector from './inspector';
import StripeNudge from './stripe-nudge';
import Context from './context';
import apiFetch from '@wordpress/api-fetch';
import { isPriceValid, minimumTransactionAmountForCurrency } from '.';

/**
 * @typedef { import('./plan').Plan } Plan
 */

/**
 * @typedef { import('./tabs').Tab } Tab
 * @type { Tab[] }
 */
const tabs = [
	{
		id: 'premium',
		label: <span>{ __( 'Subscriber View', 'premium-content' ) }</span>,
		className: 'wp-premium-content-subscriber-view',
	},
	{
		id: 'wall',
		label: <span>{ __( 'Non-subscriber View', 'premium-content' ) }</span>,
		className: 'wp-premium-content-logged-out-view',
	},
];

const API_STATE_LOADING = 0;
const API_STATE_CONNECTED = 1;
const API_STATE_NOTCONNECTED = 2;

/**
 * @type { Plan[] }
 */
const emptyProducts = [];

/**
 * @type {?string}
 */
const defaultString = null;

/**
 *
 * @typedef { import('react').MutableRefObject<?HTMLDivElement> } ContainerRef
 */

/**
 * Block edit function
 *
 * @typedef { import('@wordpress/components').withNotices.Props } NoticeProps
 * @typedef { import('./').Attributes } Attributes
 * @typedef { Object } OwnProps
 * @property { boolean } isSelected
 * @property { string } className
 * @property { string } clientId
 * @property { string } containerClientId
 * @property { Attributes } attributes
 * @property { (attributes: Partial<Attributes>) => void } setAttributes
 * @property { ?Element } noticeUI
 * @property { number } postId
 * @property { () => void } selectBlock
 *
 * @typedef { NoticeProps & OwnProps } Props
 *
 * @param { Props } props
 */

function Edit( props ) {
	const [ selectedTab, selectTab ] = useState( tabs[ 1 ] );
	const [ selectedInnerBlock, hasSelectedInnerBlock ] = useState( false );
	const [ products, setProducts ] = useState( emptyProducts );
	const [ connectURL, setConnectURL ] = useState( defaultString );
	const [ apiState, setApiState ] = useState( API_STATE_LOADING );
	const [ shouldUpgrade, setShouldUpgrade ] = useState( false );
	const [ upgradeURL, setUpgradeURL ] = useState( '' );
	// @ts-ignore needed in some upgrade flows - depending how we implement this
	const [ siteSlug, setSiteSlug ] = useState( '' ); // eslint-disable-line

	/**
	 * Hook to save a new plan.
	 *
	 * @typedef {import('./inspector').PlanAttributes} PlanAttributes
	 * @param {PlanAttributes} attributes
	 * @param {(isSuccessful: boolean) => void} callback
	 */
	function savePlan( attributes, callback ) {
		const path = '/wpcom/v2/memberships/product';
		const method = 'POST';
		if ( ! attributes.newPlanName || attributes.newPlanName.length === 0 ) {
			onError( props, __( 'Plan requires a name', 'premium-content' ) );
			callback( false );
			return;
		}

		const newPrice = parseFloat( attributes.newPlanPrice );
		const minPrice = minimumTransactionAmountForCurrency( attributes.newPlanCurrency );
		const minimumPriceNote = sprintf(
			__( 'Minimum allowed price is %s.', 'premium-content' ),
			formatCurrency( minPrice, attributes.newPlanCurrency )
		);

		if ( newPrice < minPrice ) {
			onError( props, minimumPriceNote );
			callback( false );
			return;
		}

		if ( ! isPriceValid( attributes.newPlanCurrency, newPrice ) ) {
			onError( props, __( 'Plan requires a valid price', 'premium-content' ) );
			callback( false );
			return;
		}

		const data = {
			currency: attributes.newPlanCurrency,
			price: attributes.newPlanPrice,
			title: attributes.newPlanName,
			interval: attributes.newPlanInterval,
		};
		const fetch = { path, method, data };
		apiFetch( fetch ).then(
			/**
			 * @param { any } result
			 * @return { void }
			 */
			( result ) => {
				/**
				 * @type { Plan }
				 */
				const newProduct = {
					id: result.id,
					title: result.title,
					interval: result.interval,
					price: result.price,
					currency: result.currency,
				};
				setProducts( products.concat( [ newProduct ] ) );
				// After successful adding of product, we want to select it. Presumably that is the product user wants.
				selectPlan( newProduct );
				onSuccess( props, __( 'Successfully created plan', 'premium-content' ) );
				if ( callback ) {
					callback( true );
				}
			},
			/**
			 * @param { Error } error
			 * @return { void }
			 */
			() => {
				onError( props, __( 'There was an error when adding the plan.' ) );
				if ( callback ) {
					callback( false );
				}
			}
		);
	}

	/**
	 * @param {Plan} plan
	 */
	function getPlanDescription( plan ) {
		const amount = formatCurrency( parseFloat( plan.price ), plan.currency );
		if ( plan.interval === '1 month' ) {
			return sprintf( __( '%s / month', 'premium-content' ), amount );
		}
		if ( plan.interval === '1 year' ) {
			return sprintf( __( '%s / year', 'premium-content' ), amount );
		}
		if ( plan.interval === 'one-time' ) {
			return amount;
		}
		return sprintf( __( '%s / %s', 'premium-content' ), amount, plan.interval );
	}

	/**
	 * @param {Plan} plan
	 */
	function selectPlan( plan ) {
		props.setAttributes( { selectedPlanId: plan.id } );
	}
	//We would like to hide the tabs and controls when user clicks outside the premium content block
	/**
	 * @type { ContainerRef }
	 */
	const wrapperRef = useRef( null );
	useOutsideAlerter( wrapperRef, hasSelectedInnerBlock );

	const { isSelected, className } = props;

	useEffect( () => {
		const path = '/wpcom/v2/memberships/status';
		const method = 'GET';
		const fetch = { path, method };
		apiFetch( fetch ).then(
			/**
			 * @param {any} result
			 */
			( result ) => {
				if ( ! result && typeof result !== 'object' ) {
					return;
				}
				if (
					result.errors &&
					Object.values( result.errors ) &&
					Object.values( result.errors )[ 0 ][ 0 ]
				) {
					setApiState( API_STATE_NOTCONNECTED );
					onError( props, Object.values( result.errors )[ 0 ][ 0 ] );
					return;
				}

				setConnectURL( result.connect_url );
				setShouldUpgrade( result.should_upgrade_to_access_memberships );
				setUpgradeURL( result.upgrade_url );
				setSiteSlug( result.site_slug );

				if (
					result.products &&
					result.products.length === 0 &&
					! result.should_upgrade_to_access_memberships &&
					result.connected_account_id
				) {
					// Is ready to use and has no product set up yet. Let's create one!
					savePlan(
						{
							newPlanCurrency: 'USD',
							newPlanPrice: 5,
							newPlanName: __( 'Monthly Subscription' ),
							newPlanInterval: '1 month',
						},
						() => {
							setApiState(
								result.connected_account_id ? API_STATE_CONNECTED : API_STATE_NOTCONNECTED
							);
						}
					);
					return;
				} else if ( result.products && result.products.length > 0 ) {
					setProducts( result.products );
					if ( ! props.attributes.selectedPlanId ) {
						selectPlan( result.products[ 0 ] );
					}
				}
				setApiState( result.connected_account_id ? API_STATE_CONNECTED : API_STATE_NOTCONNECTED );
			},
			/**
			 * @param { Error } result
			 */
			( result ) => {
				setConnectURL( null );
				setApiState( API_STATE_NOTCONNECTED );
				onError( props, result.message );
			}
		);
		props.selectBlock();
	}, [] );

	if ( apiState === API_STATE_LOADING ) {
		return (
			<div className={ className } ref={ wrapperRef }>
				{ props.noticeUI }
				<Placeholder
					icon="lock"
					label={ __( 'Premium Content', 'premium-content' ) }
					instructions={ __( 'Loading data...', 'premium-content' ) }
				>
					<Spinner />
				</Placeholder>
			</div>
		);
	}

	if ( shouldUpgrade ) {
		return (
			<div className={ className } ref={ wrapperRef }>
				{ props.noticeUI }
				<Placeholder
					icon="lock"
					label={ __( 'Premium Content', 'premium-content' ) }
					instructions={ __(
						"You'll need to upgrade your plan to use the Premium Content block.",
						'premium-content'
					) }
				>
					<Button
						/**
						 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42883
						 */
						// @ts-ignore isSecondary is missing from the type definition
						isSecondary
						isLarge
						href={ upgradeURL }
						target="_blank"
						className="premium-content-block-nudge__button"
					>
						{ __( 'Upgrade Your Plan', 'premium-content' ) }
					</Button>
					<div className="membership-button__disclaimer">
						<ExternalLink href="https://wordpress.com/support/premium-content-block/">
							{ __( 'Read more about Premium Content and related fees.', 'premium-content' ) }
						</ExternalLink>
					</div>
				</Placeholder>
			</div>
		);
	}

	let stripeNudge = null;

	if ( ! shouldUpgrade && apiState !== API_STATE_CONNECTED && connectURL ) {
		const stripeConnectUrl = getConnectUrl( props, connectURL );

		stripeNudge = <StripeNudge { ...props } stripeConnectUrl={ stripeConnectUrl } />;
	}

	return (
		<div className={ className } ref={ wrapperRef }>
			{ props.noticeUI }
			{ ( isSelected || selectedInnerBlock ) && apiState === API_STATE_CONNECTED && (
				<Controls
					{ ...props }
					plans={ products }
					selectedPlanId={ props.attributes.selectedPlanId }
					onSelected={ selectPlan }
					getPlanDescription={ getPlanDescription }
				/>
			) }
			{ ( isSelected || selectedInnerBlock ) && apiState === API_STATE_CONNECTED && (
				<Inspector { ...props } savePlan={ savePlan } siteSlug={ siteSlug } />
			) }
			{ ( isSelected || selectedInnerBlock ) && (
				<Tabs { ...props } tabs={ tabs } selectedTab={ selectedTab } onSelected={ selectTab } />
			) }
			<Context.Provider
				value={ {
					selectedTab,
					stripeNudge,
				} }
			>
				<Blocks />
			</Context.Provider>
		</div>
	);
}

/**
 * Hook that alerts clicks outside of the passed ref
 *
 * @param { ContainerRef } ref
 * @param { (clickedInside: boolean) => void } callback
 */
function useOutsideAlerter( ref, callback ) {
	/**
	 * Alert if clicked on outside of element
	 *
	 * @param {MouseEvent} event
	 */
	function handleClickOutside( event ) {
		if (
			ref.current &&
			event.target &&
			event.target instanceof Node &&
			! ref.current.contains( event.target )
		) {
			callback( false );
		} else {
			callback( true );
		}
	}

	useEffect( () => {
		// Bind the event listener
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	} );
}
/**
 * @param { Props } props
 * @param { string } message
 * @return { void }
 */
function onError( props, message ) {
	const { noticeOperations } = props;
	noticeOperations.removeAllNotices();
	noticeOperations.createErrorNotice( message );
}

/**
 * @param { Props } props
 * @param { string } message
 * @return { void }
 */
function onSuccess( props, message ) {
	const { noticeOperations } = props;
	noticeOperations.removeAllNotices();
	noticeOperations.createNotice( { status: 'info', content: message } );
}

/**
 * @param { Props } props
 * @param { string } connectURL
 * @return { null | string } URL
 */
function getConnectUrl( props, connectURL ) {
	const { postId } = props;

	if ( ! isURL( connectURL ) ) {
		return null;
	}

	if ( ! postId ) {
		return connectURL;
	}

	let decodedState;
	try {
		const state = getQueryArg( connectURL, 'state' );
		if ( typeof state === 'string' ) {
			decodedState = JSON.parse( atob( state ) );
		}
	} catch ( err ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			console.error( err ); // eslint-disable-line no-console
		}
		return connectURL;
	}

	decodedState.from_editor_post_id = postId;

	return addQueryArgs( connectURL, { state: btoa( JSON.stringify( decodedState ) ) } );
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const { getCurrentPostId } = select( 'core/editor' );
		return {
			postId: getCurrentPostId(),
			// @ts-ignore difficult to type via JSDoc
			containerClientId: select( 'core/block-editor' ).getBlockHierarchyRootClientId(
				ownProps.clientId
			),
		};
	} ),
	withNotices,
	withDispatch( ( dispatch, ownProps ) => {
		const blockEditor = dispatch( 'core/block-editor' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type via JSDoc
				blockEditor.selectBlock( ownProps.containerClientId );
			},
		};
	} ),
] )( Edit );
