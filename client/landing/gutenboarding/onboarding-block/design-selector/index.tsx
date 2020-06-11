/**
 * External dependencies
 */
import { Tooltip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import React from 'react';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { SubTitle, Title } from '../../components/titles';
import { usePath, Step } from '../../path';
import { useTrackStep } from '../../hooks/use-track-step';
import Badge from '../../components/badge';
import designs, { getDesignImageUrl } from '../../available-designs';
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import Link from '../../components/link';
import type { Design } from '../../stores/onboard/types';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-selector__option-name__${ slug }`;

const DesignSelector: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { push } = useHistory();
	const makePath = usePath();

	const { setSelectedDesign, setFonts } = useDispatch( ONBOARD_STORE );
	const { getSelectedDesign, hasPaidDesign } = useSelect( ( select ) => select( ONBOARD_STORE ) );

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
						{ __( 'Pick your favorite homepage layout. You can customize or change it later.' ) }
					</SubTitle>
				</div>
				<Link
					className="design-selector__start-over-button"
					to={ makePath( Step.IntentGathering ) }
					isLink
				>
					{ __( 'Go back' ) }
				</Link>
			</div>
			<div className="design-selector__design-grid">
				<div className="design-selector__grid">
					{ designs.featured.map( ( design ) => (
						<button
							key={ design.slug }
							className="design-selector__design-option"
							data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
							onClick={ () => {
								setSelectedDesign( design );

								// Update fonts to the design defaults
								setFonts( design.fonts );

								push( makePath( Step.Style ) );
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
													<span>{ __( 'Premium' ) }</span>
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
