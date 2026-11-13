import { Button, ExternalLink, SelectControl, Spinner, TextControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useWooHandoff } from '../data/use-woo-handoff';
import { useHelpCenterTracksEvent } from '../hooks/use-help-center-tracks-event';
import {
	getWooRoutingInput,
	isProductAsked,
	isStoreAsked,
	isStoreRequired,
} from '../human-routing/woo-handoff';
import { getWooHumanSupportRoute } from '../human-routing/woo-human-routing';
import type { HumanSupportQuestionType } from '../human-routing/types';
import type { HumanSupportRouting, HumanSupportRoutingStepProps } from '@automattic/odie-client';
import './woo-human-support-routing-step.scss';

const ANOTHER_SITE = 'another-site';
const WOO_DOCS_URL = 'https://woocommerce.com/documentation/';

const getQuestionOptions = ( isVendor: boolean ) => [
	{ value: 'technical-support', label: __( 'Technical support', __i18n_text_domain__ ) },
	{ value: 'pre-sales', label: __( 'Presales', __i18n_text_domain__ ) },
	{ value: 'start-scale-store', label: __( 'Start or scale a store', __i18n_text_domain__ ) },
	{ value: 'account', label: __( 'Manage my WooCommerce.com account', __i18n_text_domain__ ) },
	...( isVendor
		? [ { value: 'marketplace-vendor', label: __( 'Marketplace Vendors', __i18n_text_domain__ ) } ]
		: [] ),
];

/**
 * Asks a WooCommerce.com merchant what they need before a request for a human goes anywhere,
 * then picks the route with the who-gets-a-human table (WOOPUBR-2400).
 */
export function WooHumanSupportRoutingStep( {
	request,
	startChat,
	dismiss,
}: HumanSupportRoutingStepProps ) {
	const { data: handoff, isPending } = useWooHandoff();
	const wooHandoff = handoff?.merchant ?? null;
	const recordTracksEvent = useHelpCenterTracksEvent();
	const [ question, setQuestion ] = useState< HumanSupportQuestionType | null >( null );
	const [ productSlug, setProductSlug ] = useState< string | null >( null );
	const [ storeChoice, setStoreChoice ] = useState< string | null >( null );
	const [ otherStoreUrl, setOtherStoreUrl ] = useState( '' );
	const stepRef = useRef< HTMLDivElement >( null );
	const actionsRef = useRef< HTMLDivElement >( null );
	// A second click before the step closes would start a second chat.
	const hasContinuedRef = useRef( false );

	// The chat only scrolls for new messages, so bring the questions into view.
	useEffect( () => {
		stepRef.current?.scrollIntoView?.( { behavior: 'smooth', block: 'nearest' } );
	}, [] );

	const stores = wooHandoff?.connectedStores ?? [];
	const products = wooHandoff?.supportedProducts ?? [];
	const product = products.find( ( { slug } ) => slug === productSlug ) ?? null;

	const showProduct = isProductAsked( question ) && products.length > 0;
	const storeIsAsked = isStoreAsked( question, product );
	// With one connected store, use it without asking.
	const onlyStore = stores.length === 1 ? stores[ 0 ] : null;
	const showStorePicker = storeIsAsked && ! onlyStore && stores.length > 0;
	const showOtherStore =
		storeIsAsked && ! onlyStore && ( stores.length === 0 || storeChoice === ANOTHER_SITE );

	// The questions, and new ones, push Continue down, out of the chat's view, so bring it back.
	useEffect( () => {
		actionsRef.current?.scrollIntoView?.( { behavior: 'smooth', block: 'nearest' } );
	}, [ isPending, showProduct, showStorePicker, showOtherStore ] );

	let storeUrl: string | null = null;
	if ( onlyStore && storeIsAsked ) {
		storeUrl = onlyStore.url;
	} else if ( showOtherStore ) {
		storeUrl = otherStoreUrl.trim() || null;
	} else if ( storeIsAsked ) {
		storeUrl = storeChoice;
	}

	const canContinue =
		! isPending &&
		!! question &&
		( ! showProduct || !! productSlug ) &&
		( ! storeIsAsked || ! isStoreRequired( question ) || !! storeUrl );

	const onContinue = () => {
		if ( ! canContinue || hasContinuedRef.current ) {
			return;
		}
		hasContinuedRef.current = true;

		const { route, rowId } = getWooHumanSupportRoute(
			getWooRoutingInput( {
				data: wooHandoff,
				flags: request.flags,
				answers: { question, productSlug: showProduct ? productSlug : null, storeUrl },
			} )
		);

		recordTracksEvent( 'calypso_helpcenter_human_support_routing_decided', {
			route,
			row_id: rowId,
			question,
			product: showProduct ? productSlug : null,
			has_store: !! storeUrl,
			has_merchant_data: !! wooHandoff,
			is_emergency: request.flags.isEmergency,
			is_unknown_charge: request.flags.isUnknownCharge,
			created_from: request.createdFrom,
		} );

		// Until the other routes are built (WOOPUBR-2404), they start a chat, as every request does today.
		startChat();
	};

	// The support form turns these merchants away too, with the same message. It's the answer, so
	// there's no Done: that would put the chat's "connect me" buttons back for the same request.
	if ( handoff?.isSupportBlocked ) {
		return (
			<div className="help-center-woo-routing-step" ref={ stepRef }>
				<p className="help-center-woo-routing-step__message">
					{ createInterpolateElement(
						__(
							'You no longer have access to our direct support channels. You can still review our <docs>documentation</docs> for details about how to use WooCommerce and its extensions on your site.',
							__i18n_text_domain__
						),
						{
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							docs: <ExternalLink href={ WOO_DOCS_URL } />,
						}
					) }
				</p>
			</div>
		);
	}

	return (
		<div className="help-center-woo-routing-step" ref={ stepRef }>
			<h3 className="help-center-woo-routing-step__title">
				{ __( 'Before we connect you', __i18n_text_domain__ ) }
			</h3>
			<p className="help-center-woo-routing-step__intro">
				{ __(
					'Answer a few questions so we can get you to the right place.',
					__i18n_text_domain__
				) }
			</p>
			{ isPending ? (
				<Spinner className="help-center-woo-routing-step__spinner" />
			) : (
				<>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'What do you need help with?', __i18n_text_domain__ ) }
						value={ question ?? '' }
						options={ [
							{ value: '', label: __( 'Select an option', __i18n_text_domain__ ), disabled: true },
							...getQuestionOptions( !! wooHandoff?.isVendor ),
						] }
						onChange={ ( value ) => {
							setQuestion( ( value || null ) as HumanSupportQuestionType | null );
							setProductSlug( null );
						} }
					/>
					{ showProduct && (
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Product', __i18n_text_domain__ ) }
							value={ productSlug ?? '' }
							options={ [
								{
									value: '',
									label: __( 'Select a product', __i18n_text_domain__ ),
									disabled: true,
								},
								...products.map( ( { slug, name } ) => ( { value: slug, label: name } ) ),
							] }
							onChange={ ( value ) => setProductSlug( value || null ) }
						/>
					) }
					{ showStorePicker && (
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Store', __i18n_text_domain__ ) }
							value={ storeChoice ?? '' }
							options={ [
								{ value: '', label: __( 'Select a store', __i18n_text_domain__ ), disabled: true },
								...stores.map( ( { url, domain } ) => ( { value: url, label: domain } ) ),
								{ value: ANOTHER_SITE, label: __( 'Another site', __i18n_text_domain__ ) },
							] }
							onChange={ ( value ) => setStoreChoice( value || null ) }
						/>
					) }
					{ showOtherStore && (
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Store address', __i18n_text_domain__ ) }
							placeholder="https://"
							value={ otherStoreUrl }
							onChange={ setOtherStoreUrl }
						/>
					) }
				</>
			) }
			<div className="help-center-woo-routing-step__actions" ref={ actionsRef }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ dismiss }>
					{ __( 'Cancel', __i18n_text_domain__ ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! canContinue }
					accessibleWhenDisabled
					onClick={ onContinue }
				>
					{ __( 'Continue', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}

export const WOO_HUMAN_SUPPORT_ROUTING: HumanSupportRouting = {
	Step: WooHumanSupportRoutingStep,
};
