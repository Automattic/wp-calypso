/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import React, { useState, FunctionComponent, MouseEvent, createRef } from 'react';
import classnames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import PageLayoutSelector from './page-layout-selector';
import { partition } from 'lodash';
import { ESCAPE } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { SiteVertical } from '../../stores/onboard/types';
import { Template } from '../../stores/verticals-templates/types';
import DesignCard from './design-card';

import './style.scss';

const DesignSelector: FunctionComponent = () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical as SiteVertical
	);

	const templates =
		useSelect( select =>
			select( 'automattic/verticals/templates' ).getTemplates( siteVertical.id )
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
	const [ cp, setCp ] = useState< number >();

	const overlay = createRef< HTMLDivElement >();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
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
									design={ design }
									isSelected={ design.slug === selectedDesign?.slug }
									style={
										selectedDesign?.slug === design.slug
											? {
													transform: `translate3d( 0, calc( -100vh + ${ -( cp ?? 0 ) +
														10 }px ), 0 )`,
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
			</div>
			{ hasSelectedDesign && (
				// eslint-disable-next-line jsx-a11y/no-static-element-interactions
				<div
					ref={ overlay }
					className="page-layout-selector__overlay"
					onClick={ ( e: React.MouseEvent< HTMLDivElement > ) => {
						if ( e.target === overlay.current ) {
							resetState();
						}
					} }
					onKeyDown={ ( e: React.KeyboardEvent< HTMLDivElement > ) => {
						console.log( e );
						console.log( e.key );
						console.log( e.keyCode );
						if ( e.keyCode === ESCAPE ) {
							resetState();
						}
					} }
				>
					<CSSTransition in timeout={ transitionTiming } appear unmountOnExit>
						<div className="page-layout-selector__container" aria-modal="true">
							<PageLayoutSelector
								selectedDesign={ selectedDesign }
								selectedLayouts={ selectedLayouts }
								selectLayout={ toggleLayout }
								templates={ otherTemplates }
							/>
						</div>
					</CSSTransition>
				</div>
			) }
		</>
	);
};

export default DesignSelector;
