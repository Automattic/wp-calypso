import DesignPicker, { getAvailableDesigns } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import * as React from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import Badge from '../../components/badge';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import type { Design } from '@automattic/design-picker';

import './style.scss';

const Designs: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const { goBack, goNext } = useStepNavigation();
	const { setSelectedDesign, setFonts, resetFonts, setRandomizedDesigns } = useDispatch(
		ONBOARD_STORE
	);
	const {
		getSelectedDesign,
		hasPaidDesign,
		getRandomizedDesigns,
		isEnrollingInFseBeta,
	} = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const isAnchorFmSignup = useIsAnchorFm();

	const selectedDesign = getSelectedDesign();
	const isFse = isEnrollingInFseBeta();

	useTrackStep( 'DesignSelection', () => ( {
		selected_design: selectedDesign?.slug,
		is_selected_design_premium: hasPaidDesign(),
	} ) );

	const [ userHasSelectedDesign, setUserHasSelectedDesign ] = React.useState( false );

	useEffect( () => {
		if ( selectedDesign && userHasSelectedDesign ) {
			// The `userHasSelectedDesign` local state variable is used to delay
			// the call to `goNext()` by at least 1 re-render. This is to allow
			// time for the `goNext()` function to update and correctly skip the
			// `style` step when necessary
			goNext();
		}
	}, [ goNext, userHasSelectedDesign, selectedDesign ] );

	useEffect( () => {
		// Make sure we're using the right designs since we can't rely on config variables
		// any more and `getRandomizedDesigns` is auto-populated in a state-agnostic way.
		const availableDesigns = getAvailableDesigns( {
			useFseDesigns: isFse,
			randomize: true,
		} );
		setRandomizedDesigns( availableDesigns );
	}, [ isFse, setRandomizedDesigns ] );

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
					setUserHasSelectedDesign( true );

					if ( design.fonts ) {
						setFonts( design.fonts );
					} else {
						// Some designs may not specify font pairings
						resetFonts();
					}
				} }
				premiumBadge={
					<Badge className="designs__premium-badge">
						<JetpackLogo className="designs__premium-badge-logo" size={ 20 } />
						<span className="designs__premium-badge-text">{ __( 'Premium' ) }</span>
					</Badge>
				}
			/>
		</div>
	);
};

export default Designs;
