/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useLayoutEffect, useRef, FunctionComponent, useState, useEffect } from 'react';
import classnames from 'classnames';
import PageLayoutSelector from './page-layout-selector';
import { partition } from 'lodash';
import { Portal } from 'reakit/Portal';
import { useDialogState, Dialog, DialogBackdrop } from 'reakit/Dialog';
import { useSpring, animated } from 'react-spring';
import { useHistory } from 'react-router-dom';
import { Step } from '../../steps';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DesignCard from './design-card';

import './style.scss';
import { VerticalsTemplates } from '@automattic/data-stores';

import DynamicPreview from './dynamic-preview';

type Template = VerticalsTemplates.Template;

const VERTICALS_TEMPLATES_STORE = VerticalsTemplates.register();

interface Props {
	showPageSelector?: boolean;
}

const DesignSelector: FunctionComponent< Props > = ( { showPageSelector = false } ) => {
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

	// index for where we start dynamic preview.
	const [ previewIndex, setPreviewIndex ] = useState< number >( 0 );

	const [ designs, otherTemplates ] = partition(
		templates,
		( { category } ) => category === 'home'
	);

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
			showPageSelector ? -selectionTransitionShift.current : 0
		}px, 0 )`,
	} );

	const descriptionContainerSpring = useSpring( {
		transform: `translate3d( 0, ${ showPageSelector ? '0' : '100vh' }, 0 )`,
		visibility: showPageSelector ? 'visible' : 'hidden',
	} );

	const pageSelectorSpring = useSpring( {
		transform: `translate3d( 0, ${ showPageSelector ? '0' : '100vh' }, 0 )`,
		onStart: () => {
			showPageSelector && dialog.show();
		},
		onRest: () => {
			! showPageSelector && dialog.hide();
		},
	} );

	const history = useHistory();

	const stepperStyles = {
		position: 'fixed',
		bottom: '0',
		backgroundColor: 'white',
		padding: '15px',
		border: '2px solid black',
		cursor: 'pointer',
		fontSize: '20px',
	};

	return (
		<animated.div style={ designSelectorSpring }>
			<button
				style={ { ...stepperStyles, left: '0' } }
				onClick={ () => setPreviewIndex( ( previewIndex - 3 ) % designs.length ) }
			>
				Last Group
			</button>
			<button
				style={ { ...stepperStyles, right: '0' } }
				onClick={ () => setPreviewIndex( ( previewIndex + 3 ) % designs.length ) }
			>
				Next Group
			</button>
			<div
				className="design-selector__header-container"
				aria-hidden={ showPageSelector ? 'true' : undefined }
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
					'is-page-selector-open': showPageSelector,
				} ) }
			>
				<div className="design-selector__grid">
					{ designs.map( ( design, i ) => {
						let numberToPreview = 3;
						if ( i >= previewIndex && i < previewIndex + numberToPreview ) {
							return (
								<DynamicPreview
									key={ design.slug }
									design={ design }
									onClick={ () => {
										window.scrollTo( 0, 0 );
										setSelectedDesign( design );
										history.push( Step.PageSelection );
									} }
								/>
							);
						}
						return null;
					} ) }
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
					visible={ showPageSelector }
					className="design-selector__page-layout-backdrop"
				/>
			</Portal>

			<Dialog
				{ ...dialog }
				hide={ () => {
					history.push( Step.DesignSelection );
				} }
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
