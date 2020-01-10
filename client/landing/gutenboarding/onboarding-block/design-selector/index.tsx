/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import React, { useState, FunctionComponent, MouseEvent } from 'react';
import classnames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import PageLayoutSelector from './page-layout-selector';
import { partition } from 'lodash';
import { Portal } from 'reakit/Portal';
import { Dialog, DialogBackdrop } from 'reakit/Dialog';

/**
 * Internal dependencies
 */
import DesignCard from './design-card';

import './style.scss';
import { VerticalsTemplates } from '@automattic/data-stores';

type Template = VerticalsTemplates.Template;

const VERTICALS_TEMPLATES_STORE = VerticalsTemplates.register();

const DesignSelector: FunctionComponent = () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical
	);

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

	const [ selectedDesign, setSelectedDesign ] = useState< Template | undefined >();

	const [ selectedLayouts, setSelectedLayouts ] = useState< Set< string > >( new Set() );
	const resetLayouts = () => setSelectedLayouts( new Set() );
	const toggleLayout = ( layout: Template ) =>
		setSelectedLayouts( layouts => {
			const nextLayouts = new Set( layouts );
			if ( nextLayouts.has( layout.slug ) ) {
				nextLayouts.delete( layout.slug );
			} else {
				nextLayouts.add( layout.slug );
			}
			return nextLayouts;
		} );

	const resetState = () => {
		setSelectedDesign( undefined );
		resetLayouts();
	};

	const transitionTiming = 250;
	const hasSelectedDesign = !! selectedDesign;
	const [ isDialogVisible, setIsDialogVisible ] = useState( hasSelectedDesign );
	const [ cp, setCp ] = useState< number >();

	const dialogId = 'page-selector-modal';

	const descriptionOnRight: boolean =
		!! selectedDesign &&
		designs.findIndex( ( { slug } ) => slug === selectedDesign.slug ) % 2 === 0;

	return (
		<div className={ classnames( 'design-selector', { 'has-selected-design': selectedDesign } ) }>
			<div
				className="design-selector__header-container"
				onClick={ () => resetState() }
				aria-hidden={ hasSelectedDesign ? 'true' : undefined }
			>
				<h1 className="design-selector__title">
					{ NO__( 'Choose a starting design for your site' ) }
				</h1>
				<h2 className="design-selector__subtitle">
					{ NO__( "You'll be able to customize your new site in hundreds of ways." ) }
				</h2>
			</div>

			<CSSTransition in={ ! hasSelectedDesign } timeout={ transitionTiming }>
				<div className="design-selector__grid-container">
					<div className="design-selector__grid">
						{ designs.map( design => (
							<DesignCard
								key={ design.slug }
								dialogId={ dialogId }
								design={ design }
								isSelected={ design.slug === selectedDesign?.slug }
								style={
									selectedDesign?.slug === design.slug
										? {
												transform: `translate3d( 0, calc( -100vh + ${ -( cp ?? 0 ) + 10 }px ), 0 )`,
										  }
										: undefined
								}
								onClick={ ( e: MouseEvent< HTMLDivElement > ) => {
									window.scrollTo( 0, 0 );
									setCp( e.currentTarget.offsetTop );
									setSelectedDesign( currentTemplate =>
										currentTemplate?.slug === design?.slug ? undefined : design
									);
									resetLayouts();
								} }
							/>
						) ) }
					</div>
				</div>
			</CSSTransition>

			<CSSTransition in={ hasSelectedDesign } timeout={ transitionTiming }>
				<div
					className={ classnames( 'design-selector__description-container', {
						'on-right-side': descriptionOnRight,
					} ) }
				>
					<div className="design-selector__description-title">Title!</div>
					<div className="design-selector__description-description">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
						dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
						mollit anim id est laborum.
					</div>
				</div>
			</CSSTransition>

			<Portal>
				<DialogBackdrop
					visible={ hasSelectedDesign }
					className="design-selector__page-layout-backdrop"
				/>
			</Portal>

			<Dialog
				visible={ isDialogVisible }
				baseId={ dialogId }
				hide={ resetState }
				aria-labelledby="page-layout-selector__title"
				hideOnClickOutside
				hideOnEsc
			>
				<CSSTransition
					in={ hasSelectedDesign }
					onEnter={ () => setIsDialogVisible( true ) }
					onExited={ () => setIsDialogVisible( false ) }
					timeout={ transitionTiming }
				>
					<div className="design-selector__page-layout-container">
						<PageLayoutSelector
							selectedDesign={ selectedDesign }
							selectedLayouts={ selectedLayouts }
							selectLayout={ toggleLayout }
							templates={ otherTemplates }
						/>
					</div>
				</CSSTransition>
			</Dialog>
		</div>
	);
};

export default DesignSelector;
