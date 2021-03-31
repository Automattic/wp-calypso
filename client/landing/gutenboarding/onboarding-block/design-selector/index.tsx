/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
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

const DesignSelector: React.FunctionComponent = () => {
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
			<DesignPicker
				designs={ getRandomizedDesigns().featured.filter(
					( design ) =>
						// TODO Add finalized design templates to available-designs-config.json
						// along with is_anchorfm prop
						isAnchorFmSignup === design.features.includes( 'anchorfm' )
				) }
				isGridMinimal={ isAnchorFmSignup }
				locale={ locale }
				onSelect={ ( design: Design ) => {
					setSelectedDesign( design );

					// Update fonts to the design defaults
					setFonts( design.fonts );

					goNext();
				} }
				premiumBadge={
					<Badge className="design-selector__premium-badge">
						<JetpackLogo className="design-selector__premium-badge-logo" size={ 20 } />
						<span className="design-selector__premium-badge-text">{ __( 'Premium' ) }</span>
					</Badge>
				}
			/>
		</div>
	);
};

export default DesignSelector;
