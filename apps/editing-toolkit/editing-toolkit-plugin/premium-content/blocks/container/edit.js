/**
 * WordPress dependencies
 */
import { useEffect, useState, useRef } from '@wordpress/element';
import { Disabled, Placeholder, Spinner, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { addQueryArgs, getQueryArg, isURL } from '@wordpress/url';
import formatCurrency from '@automattic/format-currency';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import Blocks from './blocks';
import Controls from './controls';
import Inspector from './inspector';
import Context from './context';
import { flashIcon } from './icons';
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
		label: <span>{ __( 'Subscriber View', 'full-site-editing' ) }</span>,
		className: 'wp-premium-content-subscriber-view',
	},
	{
		id: 'wall',
		label: <span>{ __( 'Non-subscriber View', 'full-site-editing' ) }</span>,
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
 * @typedef { import('react').MutableRefObject<?object> } ContainerRef
 */

/**
 * Block edit function
 *
 * @typedef { import('./').Attributes } Attributes
 * @typedef {object} OwnProps
 * @property { boolean } isSelected
 * @property { string } className
 * @property { string } clientId
 * @property { Attributes } attributes
 * @property { (attributes: object<Attributes>) => void } setAttributes
 * @property { number } postId
 * @property { () => void } selectBlock
 *
 * @typedef { OwnProps } Props
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
	// @ts-ignore needed in some upgrade flows - depending how we implement this
	const [ siteSlug, setSiteSlug ] = useState( '' ); // eslint-disable-line
	const { isPreview } = props.attributes;

	/**
	 * Hook to save a new plan.
	 *
	 * @typedef {import('./inspector').PlanAttributes} PlanAttributes
	 * @param {PlanAttributes} attributes - attributes for new plan
	 * @param {(isSuccessful: boolean) => void} callback - callback function
	 */
	function savePlan( attributes, callback ) {
		const path = '/wpcom/v2/memberships/product';
		const method = 'POST';
		if ( ! attributes.newPlanName || attributes.newPlanName.length === 0 ) {
			onError( props, __( 'Plan requires a name', 'full-site-editing' ) );
			callback( false );
			return;
		}

		const newPrice = parseFloat( attributes.newPlanPrice );
		const minPrice = minimumTransactionAmountForCurrency( attributes.newPlanCurrency );
		const minimumPriceNote = sprintf(
			// translators: %s: Price
			__( 'Minimum allowed price is %s.', 'full-site-editing' ),
			formatCurrency( minPrice, attributes.newPlanCurrency )
		);

		if ( newPrice < minPrice ) {
			onError( props, minimumPriceNote );
			callback( false );
			return;
		}

		if ( ! isPriceValid( attributes.newPlanCurrency, newPrice ) ) {
			onError( props, __( 'Plan requires a valid price', 'full-site-editing' ) );
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
			 * @param { any } result - Result of fetch query
			 * @returns { void }
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
				onSuccess( props, __( 'Successfully created plan', 'full-site-editing' ) );
				if ( callback ) {
					callback( true );
				}
			},
			/**
			 * @returns { void }
			 */
			() => {
				onError( props, __( 'There was an error when adding the plan.', 'full-site-editing' ) );
				if ( callback ) {
					callback( false );
				}
			}
		);
	}

	/**
	 * @param {Plan} plan - plan whose description will be retrieved
	 */
	function getPlanDescription( plan ) {
		const amount = formatCurrency( parseFloat( plan.price ), plan.currency );
		if ( plan.interval === '1 month' ) {
			// translators: %s: amount
			return sprintf( __( '%s / month', 'full-site-editing' ), amount );
		}
		if ( plan.interval === '1 year' ) {
			// translators: %s: amount
			return sprintf( __( '%s / year', 'full-site-editing' ), amount );
		}
		if ( plan.interval === 'one-time' ) {
			return amount;
		}
		// translators: %s: amount, plan interval
		return sprintf( __( '%1$s / %2$s', 'full-site-editing' ), amount, plan.interval );
	}

	/**
	 * @param {Plan} plan - selected plan
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
		if ( isPreview ) {
			return;
		}

		const origin = getQueryArg( window.location.href, 'origin' );
		const path = addQueryArgs( '/wpcom/v2/memberships/status', {
			source: origin === 'https://wordpress.com' ? 'gutenberg-wpcom' : 'gutenberg',
		} );
		const method = 'GET';
		const fetch = { path, method };
		apiFetch( fetch ).then(
			/**
			 * @param {any} result - fetch query result
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
							newPlanName: __( 'Monthly Subscription', 'full-site-editing' ),
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
			 * @param { Error } result - fetch query error result
			 */
			( result ) => {
				setConnectURL( null );
				setApiState( API_STATE_NOTCONNECTED );
				onError( props, result.message );
			}
		);

		// Execution delayed with setTimeout to ensure it runs after any block auto-selection performed by inner blocks
		// (such as the Recurring Payments block)
		setTimeout( () => props.selectBlock(), 1000 );
	}, [] );

	if ( apiState === API_STATE_LOADING && ! isPreview ) {
		return (
			<div className={ className } ref={ wrapperRef }>
				<Placeholder
					icon="lock"
					label={ __( 'Premium Content', 'full-site-editing' ) }
					instructions={ __( 'Loading data…', 'full-site-editing' ) }
				>
					<Spinner />
				</Placeholder>
			</div>
		);
	}

	const shouldShowConnectButton = () => {
		if ( ! shouldUpgrade && apiState !== API_STATE_CONNECTED && connectURL ) {
			return true;
		}

		return false;
	};

	return (
		<>
			<BlockControls>
				{ shouldShowConnectButton() && (
					<ToolbarGroup>
						<ToolbarButton
							icon={ flashIcon }
							onClick={ ( e ) => {
								props.autosaveAndRedirect( e, getConnectUrl( props, connectURL ) );
							} }
							className="connect-stripe components-tab-button"
						>
							{ __( 'Connect Stripe', 'full-site-editing' ) }
						</ToolbarButton>
					</ToolbarGroup>
				) }

				<ToolbarGroup>
					<ToolbarButton
						onClick={ () => {
							selectTab( tabs[ 1 ] );
						} }
						className="components-tab-button"
						isPressed={ selectedTab.className === 'wp-premium-content-logged-out-view' }
					>
						<span>{ __( 'Visitor View', 'full-site-editing' ) }</span>
					</ToolbarButton>
					<ToolbarButton
						onClick={ () => {
							selectTab( tabs[ 0 ] );
						} }
						className="components-tab-button"
						isPressed={ selectedTab.className !== 'wp-premium-content-logged-out-view' }
					>
						<span>{ __( 'Subscriber View', 'full-site-editing' ) }</span>
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<div className={ className } ref={ wrapperRef }>
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
				<Context.Provider
					value={ {
						selectedTab,
					} }
				>
					<Blocks />
				</Context.Provider>
			</div>
		</>
	);
}

/**
 * Hook that alerts clicks outside of the passed ref
 *
 * @param { ContainerRef } ref - container ref
 * @param { (clickedInside: boolean) => void } callback - callback function
 */
function useOutsideAlerter( ref, callback ) {
	/**
	 * Alert if clicked on outside of element
	 *
	 * @param {object} event - click event
	 */
	function handleClickOutside( event ) {
		if (
			ref.current &&
			event.target &&
			// eslint-disable-next-line no-undef
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
 * @param { Props } props - error properties
 * @param { string } message - error message
 * @returns { void }
 */
function onError( props, message ) {
	props.createErrorNotice( message, { type: 'snackbar' } );
}

/**
 * @param { Props } props - success properties
 * @param { string } message - success message
 * @returns { void }
 */
function onSuccess( props, message ) {
	props.createSuccessNotice( message, { type: 'snackbar' } );
}

/**
 * @param { Props } props - properties
 * @param { string } connectURL - Stripe connect URL
 * @returns { null | string } URL
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
			decodedState = JSON.parse( window.atob( state ) );
		}
	} catch ( err ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			console.error( err ); // eslint-disable-line no-console
		}
		return connectURL;
	}

	decodedState.from_editor_post_id = postId;

	return addQueryArgs( connectURL, { state: window.btoa( JSON.stringify( decodedState ) ) } );
}

function MaybeDisabledEdit( props ) {
	// The block transformations menu renders a block preview popover using real blocks
	// for transformation. The block previews do not play nicely with useEffect and
	// updating content after a resolved API call. To disarm the block preview, we can
	// check to see if the block is being rendered within a Disabled context, and set
	// the isPreview flag accordingly.
	return (
		<Disabled.Consumer>
			{ ( isDisabled ) => {
				return (
					<Edit
						{ ...props }
						attributes={ {
							...props.attributes,
							isPreview: isDisabled || props.attributes?.isPreview,
						} }
					/>
				);
			} }
		</Disabled.Consumer>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const { getCurrentPostId } = select( 'core/editor' );
		return {
			postId: getCurrentPostId(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const blockEditor = dispatch( 'core/block-editor' );
		const notices = dispatch( 'core/notices' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type via JSDoc
				blockEditor.selectBlock( ownProps.clientId );
			},
			autosaveAndRedirect: async ( event, stripeConnectUrl ) => {
				event.preventDefault(); // Don't follow the href before autosaving
				await dispatch( 'core/editor' ).savePost();
				// Using window.top to escape from the editor iframe on WordPress.com
				window.top.location.href = stripeConnectUrl;
			},
			createErrorNotice: notices.createErrorNotice,
			createSuccessNotice: notices.createSuccessNotice,
		};
	} ),
] )( MaybeDisabledEdit );
