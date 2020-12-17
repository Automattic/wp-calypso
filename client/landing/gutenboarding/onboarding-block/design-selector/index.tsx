/**
 * External dependencies
 */
import { Tooltip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import React from 'react';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import Badge from '../../components/badge';
import { getDesignImageUrl } from '../../available-designs';
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import type { Design } from '../../stores/onboard/types';
import { useIsAnchorFm } from '../../path';

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
	const isAnchorFmSignup = useIsAnchorFm();

	useTrackStep( 'DesignSelection', () => ( {
		selected_design: getSelectedDesign()?.slug,
		is_selected_design_premium: hasPaidDesign(),
	} ) );

	return (
		<div className="gutenboarding-page design-selector">
			<div className="design-selector__header">
				<div className="design-selector__heading">
					<Title>{ __( 'Choose a design' ) }</Title>
					<SubTitle>
						{ isAnchorFmSignup
							? __(
									'Pick a homepage layout for your podcast site. You can customize or change it later.'
							  )
							: __( 'Pick your favorite homepage layout. You can customize or change it later.' ) }
					</SubTitle>
				</div>
				<ActionButtons>
					<BackButton onClick={ goBack } />
				</ActionButtons>
			</div>
			<div className="design-selector__design-grid">
				<div
					className={ isAnchorFmSignup ? 'design-selector__grid-minimal' : 'design-selector__grid' }
				>
					{ getRandomizedDesigns()
						.featured.filter(
							( design ) =>
								// TODO Add finalized design templates to client/landing/gutenboarding/available-designs-config.json
								// along with is_anchorfm prop
								isAnchorFmSignup === design.features.includes( 'anchorfm' )
						)
						.map( ( design ) => (
							<button
								key={ design.slug }
								className="design-selector__design-option"
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
									<span id={ makeOptionId( design ) } className="design-selector__option-meta">
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
														<span className="design-selector__premium-badge-text">
															{ __( 'Premium' ) }
														</span>
													</Badge>
												</div>
											</Tooltip>
										) }
									</span>
								</span>
							</button>
						) ) }
				</div>
			</div>
		</div>
	);
};

export default DesignSelector;
