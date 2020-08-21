/**
 * External dependencies
 */
import { Tooltip, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import React from 'react';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import Badge from '../../components/badge';
import { getDesignImageUrl } from '../../available-designs';
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import type { Design } from '../../stores/onboard/types';
import MenuAndContentLayout from '../../components/menu-and-content-layout';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

/**
 * Style dependencies
 */
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-selector__option-name__${ slug }`;

const DesignSelector: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const { setSelectedDesign, setFonts } = useDispatch( ONBOARD_STORE );
	const { getSelectedDesign, hasPaidDesign, getRandomizedDesigns } = useSelect( ( select ) =>
		select( ONBOARD_STORE )
	);
	const { isExperimental } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const [ filteredCategory, setFilteredCategory ] = React.useState( 'all' );

	// const isExperimental = false;

	useTrackStep( 'DesignSelection', () => ( {
		selected_design: getSelectedDesign()?.slug,
		is_selected_design_premium: hasPaidDesign(),
	} ) );

	const designCategories = [
		{ key: 'all', label: __( 'All Designs' ) },
		{ key: 'blog', label: __( 'Blogging' ) },
		{ key: 'portfolio', label: __( 'Portfolio' ) },
		{ key: 'business', label: __( 'Business' ) },
		// it seems all designs that have "charity" key, also have "non-profit"
		{ key: 'charity', label: __( 'Charity / Non-profit' ) },

		//{ key: 'non-profit', label: __( 'Non-profit' ) },
		{ key: 'real estate listing', label: __( 'Real estate listing' ) },
		{ key: 'school', label: __( 'School' ) },
		{ key: 'restaurant', label: __( 'Restaurant' ) },
		{ key: 'small business', label: __( 'Small business' ) },
	];

	return (
		<div className="gutenboarding-page design-selector">
			<MenuAndContentLayout columnCount={ isExperimental ? 2 : 1 }>
				<div className="design-selector__header">
					<div className="design-selector__heading">
						<Title>{ __( 'Choose a design' ) }</Title>
						<SubTitle>
							{ __( 'Pick your favorite homepage layout. You can customize or change it later.' ) }
						</SubTitle>
					</div>
					{ isExperimental && (
						<div className="design-selector__categories">
							{ designCategories.map( ( category ) => (
								<Button
									className={ classnames( { 'is-selected': category.key === filteredCategory } ) }
									isLink
									key={ category.key }
									onClick={ () => setFilteredCategory( category.key ) }
								>
									{ category.label }
								</Button>
							) ) }
						</div>
					) }
					<ActionButtons>
						<BackButton onClick={ goBack } />
					</ActionButtons>
				</div>
				<div
					className={ classnames( 'design-selector__design-grid', {
						'is-experimental': isExperimental,
					} ) }
				>
					<div className="design-selector__grid">
						<TransitionGroup component={ null }>
							{ getRandomizedDesigns()
								.featured.filter(
									( design ) =>
										filteredCategory === 'all' || design.categories.includes( filteredCategory )
								)
								.map( ( design, index ) => (
									<CSSTransition
										key={ design.slug }
										timeout={ 500 }
										classNames="design-selector__design-option"
									>
										<button
											className="design-selector__design-option"
											style={
												isExperimental
													? {
															transform: `
													translateX(calc(${ index % 3 } * (100% + 32px))) 
													translateY(calc(${ Math.floor( index / 3 ) } * (100% + 32px)))`,
													  }
													: undefined
											}
											data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
											onClick={ () => {
												setSelectedDesign( design );

												// Update fonts to the design defaults
												setFonts( design.fonts );

												goNext();
											} }
										>
											<span className="design-selector__image-frame">
												<img
													alt=""
													aria-labelledby={ makeOptionId( design ) }
													src={ getDesignImageUrl( design ) }
												/>
											</span>
											<span className="design-selector__option-overlay">
												<span
													id={ makeOptionId( design ) }
													className="design-selector__option-meta"
												>
													<span className="design-selector__option-name">{ design.title }</span>
													{ design.is_premium && (
														<Tooltip
															position="bottom center"
															text={ __( 'Requires a Personal plan or above' ) }
														>
															<div className="design-selector__premium-container">
																<Badge className="design-selector__premium-badge">
																	<JetpackLogo
																		className="design-selector__premium-badge-logo"
																		size={ 20 }
																	/>
																	<span>{ __( 'Premium' ) }</span>
																</Badge>
															</div>
														</Tooltip>
													) }
												</span>
											</span>
										</button>
									</CSSTransition>
								) ) }
						</TransitionGroup>
					</div>
				</div>
			</MenuAndContentLayout>
		</div>
	);
};

export default DesignSelector;
