/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useLayoutEffect, useRef, FunctionComponent } from 'react';
import classnames from 'classnames';
import PageLayoutSelector from './page-layout-selector';
import { partition } from 'lodash';
import { Portal } from 'reakit/Portal';
import { useDialogState, Dialog, DialogBackdrop } from 'reakit/Dialog';
import { useSpring, animated } from 'react-spring';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DesignCard from './design-card';

import './style.scss';
import { VerticalsTemplates } from '@automattic/data-stores';

type Template = VerticalsTemplates.Template;

const VERTICALS_TEMPLATES_STORE = VerticalsTemplates.register();

const DesignSelector: FunctionComponent = () => {
	const { selectedDesign, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	// @FIXME: If we don't have an ID (because we're dealing with a user-supplied vertical that
	// WordPress.com doesn't know about), fall back to the 'm1' (Business) vertical. This is the
	// vertical that the endpoint would fall back to anyway if an unknown ID is passed.
	// This seems okay since the list of templates currently appears to be the same for all verticals
	// anyway.
	// We should modify the endpoint (or rather, add a `verticals/templates` route that doesn't require
	// a vertical ID) for this case.
	const templates =
		useSelect( select =>
			select( VERTICALS_TEMPLATES_STORE ).getTemplates( siteVertical?.id ?? 'm1' )
		) ?? [];

	const [ designs, otherTemplates ] = partition(
		templates,
		( { category } ) => category === 'home'
	);

	const resetState = () => {
		setSelectedDesign( undefined );
	};

	const hasSelectedDesign = !! selectedDesign;

	const headingContainer = useRef< HTMLDivElement >( null );
	const selectionTransitionShift = useRef< number >( 0 );
	useLayoutEffect( () => {
		if ( headingContainer.current ) {
			// We'll use this height to move the heading up out of the viewport.
			const rect = headingContainer.current.getBoundingClientRect();
			selectionTransitionShift.current = rect.height;
		}
	}, [ selectedDesign ] );

	const dialogId = 'page-selector-modal';
	const dialog = useDialogState( { visible: false, baseId: dialogId } );

	const descriptionOnRight: boolean =
		!! selectedDesign &&
		designs.findIndex( ( { slug } ) => slug === selectedDesign.slug ) % 2 === 0;

	const designSelectorSpring = useSpring( {
		transform: `translate3d( 0, ${
			hasSelectedDesign ? -selectionTransitionShift.current : 0
		}px, 0 )`,
	} );

	const descriptionContainerSpring = useSpring( {
		transform: `translate3d( 0, ${ hasSelectedDesign ? '0' : '100vh' }, 0)`,
		visibility: hasSelectedDesign ? 'visible' : 'hidden',
	} );

	const pageSelectorSpring = useSpring( {
		transform: `translate3d( 0, ${ hasSelectedDesign ? '0' : '100vh' }, 0)`,
		onStart: () => {
			hasSelectedDesign && dialog.show();
		},
		onRest: () => {
			! hasSelectedDesign && dialog.hide();
		},
	} );

	return (
		<animated.div style={ designSelectorSpring }>
			<div
				className="design-selector__header-container"
				aria-hidden={ hasSelectedDesign ? 'true' : undefined }
				ref={ headingContainer }
			>
				<h1 className="design-selector__title">
					{ NO__( 'Choose a starting design for your site' ) }
				</h1>
				<h2 className="design-selector__subtitle">
					{ NO__( "You'll be able to customize your new site in hundreds of ways." ) }
				</h2>
			</div>
			<div
				className={ classnames( 'design-selector__grid-container', {
					'has-selected-design': hasSelectedDesign,
				} ) }
			>
				<div className="design-selector__grid">
					{ designs.map( design => (
						<DesignCard
							key={ design.slug }
							dialogId={ dialogId }
							design={ design }
							style={
								selectedDesign?.slug === design.slug
									? {
											gridRow: 1,
											gridColumn: descriptionOnRight ? 1 : 2,
									  }
									: {
											visibility: hasSelectedDesign ? 'hidden' : undefined,
									  }
							}
							onClick={ () => {
								window.scrollTo( 0, 0 );
								setSelectedDesign( design );
							} }
						/>
					) ) }
				</div>
			</div>

			<animated.div
				className={ classnames( 'design-selector__description-container', {
					'on-right-side': descriptionOnRight,
				} ) }
				style={ descriptionContainerSpring }
			>
				<div className="design-selector__description-title">{ selectedDesign?.title }</div>
				<div className="design-selector__description-description">
					{ /* @TODO: Real description? */ }
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</div>
			</animated.div>

			<Portal>
				<DialogBackdrop
					visible={ hasSelectedDesign }
					className="design-selector__page-layout-backdrop"
				/>
			</Portal>

			<Dialog
				{ ...dialog }
				hide={ resetState }
				aria-labelledby="page-layout-selector__title"
				hideOnClickOutside
				hideOnEsc
			>
				<animated.div
					className="design-selector__page-layout-container"
					style={ pageSelectorSpring }
				>
					<PageLayoutSelector templates={ otherTemplates } />
				</animated.div>
			</Dialog>
		</animated.div>
	);
};

export default DesignSelector;
