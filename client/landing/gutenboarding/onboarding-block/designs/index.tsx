import DesignPicker, { PremiumBadge, getAvailableDesigns } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import * as React from 'react';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import type { Design } from '@automattic/design-picker';

import './style.scss';

interface HeaderProps {
	isAnchorFmSignup: boolean;
}

const Header: React.FunctionComponent< HeaderProps > = ( { isAnchorFmSignup } ) => {
	const { __ } = useI18n();

	const { goBack } = useStepNavigation();
	const title = __( 'Choose a design' );
	const subTitle = isAnchorFmSignup
		? __( 'Pick a homepage layout for your podcast site. You can customize or change it later.' )
		: __( 'Pick your favorite homepage layout. You can customize or change it later.' );

	return (
		<div className="designs__header">
			<div className="designs__heading">
				<Title className="designs__heading-title">{ title }</Title>
				<SubTitle>{ subTitle }</SubTitle>
			</div>
			<ActionButtons>
				<BackButton onClick={ goBack } />
			</ActionButtons>
		</div>
	);
};

const Designs: React.FunctionComponent = () => {
	const locale = useLocale();
	const { goNext } = useStepNavigation();
	const { setSelectedDesign, setFonts, resetFonts, setRandomizedDesigns } = useDispatch(
		ONBOARD_STORE
	);
	const { selectedDesign, hasPaidDesign, randomizedDesigns } = useSelect( ( select ) => {
		const onboardSelect = select( ONBOARD_STORE );

		return {
			selectedDesign: onboardSelect.getSelectedDesign(),
			hasPaidDesign: onboardSelect.hasPaidDesign(),
			randomizedDesigns: onboardSelect.getRandomizedDesigns(),
		};
	} );
	const isAnchorFmSignup = useIsAnchorFm();

	useTrackStep( 'DesignSelection', () => ( {
		selected_design: selectedDesign?.slug,
		is_selected_design_premium: hasPaidDesign,
	} ) );

	const [ userHasSelectedDesign, setUserHasSelectedDesign ] = React.useState( false );

	const onSelect = ( design: Design ) => {
		setSelectedDesign( design );
		setUserHasSelectedDesign( true );

		if ( design.fonts ) {
			setFonts( design.fonts );
		} else {
			// Some designs may not specify font pairings
			resetFonts();
		}
	};

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
			featuredDesignsFilter: ( design ) => {
				if ( isAnchorFmSignup ) {
					return design.features.includes( 'anchorfm' );
				}

				return !! design.is_fse;
			},
			randomize: true,
		} );
		setRandomizedDesigns( availableDesigns );
	}, [ setRandomizedDesigns, isAnchorFmSignup ] );

	return (
		<div className="gutenboarding-page designs">
			<Header isAnchorFmSignup={ isAnchorFmSignup } />
			<DesignPicker
				designs={ randomizedDesigns.featured }
				isGridMinimal={ isAnchorFmSignup }
				locale={ locale }
				onSelect={ onSelect }
				premiumBadge={ <PremiumBadge /> }
				highResThumbnails
				recommendedCategorySlug={ null }
			/>
		</div>
	);
};

export default Designs;
