/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { InnerBlocks, __experimentalBlock as Block } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Context from './context';
import Controls from './controls';
import StripeNudge from './stripe-nudge';

const Tabs = ( props ) => {
	const { attributes, clientId, products, stripeConnectUrl } = props;
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
					<Context.Provider value={ { activeTab } }>
						<InnerBlocks templateLock={ true } templateInsertUpdatesSelection={ false } />
					</Context.Provider>
				</div>
			</div>
			<Controls { ...props } />
		</Block.div>
	);
};

export default Tabs;
