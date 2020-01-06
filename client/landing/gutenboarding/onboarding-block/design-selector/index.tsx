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

/**
 * Internal dependencies
 */
import { SiteVertical } from '../../stores/onboard/types';
import { STORE_KEY } from '../../stores/onboard';
import DesignCard from './design-card';

import './style.scss';
import { VerticalsTemplates } from '@automattic/data-stores';

type Template = VerticalsTemplates.Template;

const VERTICALS_TEMPLATES_STORE = VerticalsTemplates.register();

const DesignSelector: FunctionComponent = () => {
    const temporaryBlog = useSelect( select => select( STORE_KEY ).getTemporaryBlog() );
    
	const siteVertical = useSelect(
		select => select( STORE_KEY ).getState().siteVertical as SiteVertical
	);

	const templates =
		useSelect( select => select( VERTICALS_TEMPLATES_STORE ).getTemplates( siteVertical.id ) ) ??
		[];

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
				<div
					className="design-selector__grid-container"
					onClick={ hasSelectedDesign ? resetState : undefined }
				>
					<div className="design-selector__grid">
						{ designs.map( design => (
							<DesignCard
								key={ design.slug }
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

			<CSSTransition in={ hasSelectedDesign } timeout={ transitionTiming } unmountOnExit>
				<div className="page-layout-selector__container">
					<PageLayoutSelector
						selectedDesign={ selectedDesign }
						selectedLayouts={ selectedLayouts }
						selectLayout={ toggleLayout }
						templates={ otherTemplates }
					/>
				</div>
			</CSSTransition>
		</div>
	);
};

export default DesignSelector;
