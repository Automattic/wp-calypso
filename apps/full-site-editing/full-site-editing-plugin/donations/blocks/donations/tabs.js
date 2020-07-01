/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import {
	InnerBlocks,
	InspectorControls,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { Button, ExternalLink, PanelBody, ToggleControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import StripeNudge from './stripe-nudge';
import intervalClassNames from '../donation/interval-class-names';

const Tabs = ( { attributes, clientId, products, setAttributes, siteSlug, stripeConnectUrl } ) => {
	const { showMonthly, showAnnually, showCustom } = attributes;
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isTabActive = ( tab ) => activeTab === tab;

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);
	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );

	// Updates the inner blocks when settings are toggled.
	useEffect( () => {
		const newInnerBlocks = [];
		const intervals = [
			'one-time',
			...( showMonthly ? [ '1 month' ] : [] ),
			...( showAnnually ? [ '1 year' ] : [] ),
		];
		intervals.forEach( ( interval ) => {
			const donationBlock = innerBlocks.find( ( block ) => block.attributes.interval === interval );
			newInnerBlocks.push(
				donationBlock ??
					createBlock( 'a8c/donation', {
						planId: products[ interval ],
						interval,
					} )
			);
		} );

		if ( newInnerBlocks.length !== innerBlocks.length ) {
			replaceInnerBlocks( clientId, newInnerBlocks, false );
		}
	}, [ innerBlocks, showMonthly, showAnnually, showCustom ] );

	// Activates the one-time tab if the interval of the current active tab is disabled.
	useEffect( () => {
		if ( ! showMonthly && isTabActive( '1 month' ) ) {
			setActiveTab( 'one-time' );
		}

		if ( ! showAnnually && isTabActive( '1 year' ) ) {
			setActiveTab( 'one-time' );
		}
	}, [ showMonthly, showAnnually ] );

	// Toggles the visibility of the inner blocks based on the current tab.
	useEffect( () => {
		const activeBlock = document.querySelector( '.wp-block-a8c-donation.is-active' );
		if ( activeBlock ) {
			activeBlock.classList.remove( 'is-active' );
		}
		const newActiveBlock = document.querySelector(
			`.wp-block-a8c-donation.${ intervalClassNames[ activeTab ] }`
		);
		if ( newActiveBlock ) {
			newActiveBlock.classList.add( 'is-active' );
		}
	}, [ activeTab, innerBlocks ] );

	return (
		<Block.div>
			{ stripeConnectUrl && <StripeNudge stripeConnectUrl={ stripeConnectUrl } /> }
			<div className="donations__container">
				{ ( showMonthly || showAnnually ) && (
					<div className="donations__tabs">
						<Button
							className={ classNames( { 'is-active': isTabActive( 'one-time' ) } ) }
							onClick={ () => setActiveTab( 'one-time' ) }
						>
							{ __( 'One-Time', 'full-site-editing' ) }
						</Button>
						{ showMonthly && (
							<Button
								className={ classNames( { 'is-active': isTabActive( '1 month' ) } ) }
								onClick={ () => setActiveTab( '1 month' ) }
							>
								{ __( 'Monthly', 'full-site-editing' ) }
							</Button>
						) }
						{ showAnnually && (
							<Button
								className={ classNames( { 'is-active': isTabActive( '1 year' ) } ) }
								onClick={ () => setActiveTab( '1 year' ) }
							>
								{ __( 'Annually', 'full-site-editing' ) }
							</Button>
						) }
					</div>
				) }
				<div className="donations__content">
					<InnerBlocks templateLock={ true } templateInsertUpdatesSelection={ false } />
				</div>
			</div>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'full-site-editing' ) }>
					<ToggleControl
						checked={ showMonthly }
						onChange={ ( value ) => setAttributes( { showMonthly: value } ) }
						label={ __( 'Show monthly donations', 'full-site-editing' ) }
					/>
					<ToggleControl
						checked={ showAnnually }
						onChange={ ( value ) => setAttributes( { showAnnually: value } ) }
						label={ __( 'Show annual donations', 'full-site-editing' ) }
					/>
					<ToggleControl
						checked={ showCustom }
						onChange={ ( value ) => setAttributes( { showCustom: value } ) }
						label={ __( 'Show custom amount option', 'full-site-editing' ) }
					/>
					<ExternalLink href={ `https://wordpress.com/earn/payments/${ siteSlug }` }>
						{ __( 'View donation earnings', 'full-site-editing' ) }
					</ExternalLink>
				</PanelBody>
			</InspectorControls>
		</Block.div>
	);
};

export default Tabs;
