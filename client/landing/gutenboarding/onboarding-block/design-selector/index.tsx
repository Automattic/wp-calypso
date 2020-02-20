/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useLayoutEffect, useRef, FunctionComponent } from 'react';
import classnames from 'classnames';
import PageLayoutSelector from './page-layout-selector';
import { partition } from 'lodash';
import { useDialogState, Dialog } from 'reakit/Dialog';
import { useSpring, animated } from 'react-spring';
import { useHistory } from 'react-router-dom';
import { Step, usePath } from '../../path';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DesignCard from './design-card';

import './style.scss';
import { VerticalsTemplates } from '@automattic/data-stores';

type Template = VerticalsTemplates.Template;

const VERTICALS_TEMPLATES_STORE = VerticalsTemplates.register();

interface Props {
	showPageSelector?: boolean;
}

const DesignSelector: FunctionComponent< Props > = ( { showPageSelector = false } ) => {
	const { __: NO__ } = useI18n();
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
	const makePath = usePath();

	return (
		<animated.div style={ designSelectorSpring }>
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
				tabIndex={-1}
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
											visibility: showPageSelector ? 'hidden' : undefined,
									  }
							}
							tabIndex={ showPageSelector ? -1 : 0 }
							onClick={ () => {
								window.scrollTo( 0, 0 );
								setSelectedDesign( design );
								history.push( makePath( Step.PageSelection ) );
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

			<animated.div className="design-selector__page-layout-container" style={ pageSelectorSpring }>
				<Dialog
					{ ...dialog }
					modal={ false }
					hide={ () => {
						history.push( makePath( Step.DesignSelection ) );
					} }
					aria-labelledby="page-layout-selector__title"
					hideOnClickOutside={ false }
					hideOnEsc
				>
					<PageLayoutSelector templates={ otherTemplates } />
				</Dialog>
			</animated.div>
		</animated.div>
	);
};

export default DesignSelector;
