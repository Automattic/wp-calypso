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

	let [ designs, otherTemplates ] = partition(
		templates,
		( { category } ) => category === 'home'
	);

	designs = designs.slice( 0, 4 );

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
		<div className="design-selector gutenboarding-color-coded" data-vertical={ siteVertical?.label }>
			<div className="design-selector__header">
				<h1 className="design-selector__title">
					{ NO__( 'Choose a starting design' ) }
				</h1>
				<h2 className="design-selector__subtitle">
					{ NO__( "Get started with one of our top website layouts. You can always change it later" ) }
				</h2>
			</div>
			<div className="design-selector__design-grid">
				<div className="design-selector__grid">
					{ designs.map( design => (
						<DesignCard
							key={ design.slug }
							dialogId={ dialogId }
							design={ design }
							tabIndex={ showPageSelector ? -1 : 0 }
							onClick={ () => {
								if ( showPageSelector ) return;
								window.scrollTo( 0, 0 );
								setSelectedDesign( design );
								history.push( makePath( Step.PageSelection ) );
							} }
						/>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default DesignSelector;
