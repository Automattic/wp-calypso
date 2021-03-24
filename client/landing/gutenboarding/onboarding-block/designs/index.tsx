/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import DesignPicker from '@automattic/design-picker';
import type { Design } from '@automattic/design-picker';

/**
 * Internal dependencies
 */
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import Badge from '../../components/badge';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useIsAnchorFm } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

const Designs: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
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
		<div className="gutenboarding-page designs">
			<div className="designs__header">
				<div className="designs__heading">
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
			<DesignPicker
				designs={ getRandomizedDesigns().featured.filter(
					( design ) =>
						// TODO Add finalized design templates to available designs config
						// along with `is_anchorfm` prop (config is stored in the
						// `@automattic/design-picker` package)
						isAnchorFmSignup === design.features.includes( 'anchorfm' )
				) }
				isGridMinimal={ isAnchorFmSignup }
				locale={ locale }
				onSelect={ ( design: Design ) => {
					setSelectedDesign( design );

					// Update fonts to the design defaults
					setFonts( design.fonts );

<<<<<<< HEAD
					goNext();
				} }
				premiumBadge={
					<Badge className="designs__premium-badge">
						<JetpackLogo className="designs__premium-badge-logo" size={ 20 } />
						<span className="designs__premium-badge-text">{ __( 'Premium' ) }</span>
					</Badge>
				}
			/>
||||||| parent of 8a245dc543... TMP: hack in a new scroll
									goNext();
								} }
							>
								<span
									className={ classnames(
										'design-selector__image-frame',
										isEnabled( 'gutenboarding/landscape-preview' )
											? 'design-selector__landscape'
											: 'design-selector__portrait',
										design.preview === 'static'
											? 'design-selector__static'
											: 'design-selector__scrollable'
									) }
								>
									{ isEnabled( 'gutenboarding/mshot-preview' ) ? (
										<MShotsImage
											url={ getDesignUrl( design, locale ) }
											aria-labelledby={ makeOptionId( design ) }
											alt=""
											options={ mShotOptions() }
										/>
									) : (
										<img
											alt=""
											aria-labelledby={ makeOptionId( design ) }
											src={ getDesignImageUrl( design ) }
										/>
									) }
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
=======
									goNext();
								} }
							>
								<span
									className={ classnames(
										'design-selector__image-frame',
										isEnabled( 'gutenboarding/landscape-preview' )
											? 'design-selector__landscape'
											: 'design-selector__portrait',
										design.preview === 'static'
											? 'design-selector__static'
											: 'design-selector__scrollable'
									) }
								>
									{ isEnabled( 'gutenboarding/mshot-preview' ) ? (
										<MShotsImage
											url={ getDesignUrl( design, locale ) }
											aria-labelledby={ makeOptionId( design ) }
											alt=""
											options={ mShotOptions() }
											scrollable={ design.preview !== 'static' }
										/>
									) : (
										<img
											alt=""
											aria-labelledby={ makeOptionId( design ) }
											src={ getDesignImageUrl( design ) }
										/>
									) }
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
>>>>>>> 8a245dc543... TMP: hack in a new scroll
		</div>
	);
};

export default Designs;
