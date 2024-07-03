import { type StarterDesigns, useStarterDesignsQuery } from '@automattic/data-stores';
import { Design } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { ECOMMERCE_FLOW, StepContainer, isLinkInBioFlow } from '@automattic/onboarding';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const shouldOnlyDisplayMobileCarousel = ( flow: string | null | undefined ) => {
	switch ( true ) {
		case isLinkInBioFlow( flow ):
			return true;
		default:
			return false;
	}
};

const getEcommerceDesigns = ( allDesigns: StarterDesigns ) => {
	let selectedDesigns = allDesigns?.designs;
	const selectedDesignSlugs = [ 'tsubaki', 'amulet', 'tazza', 'zaino', 'thriving-artist' ];

	// If we have a restricted set of designs, filter out all unwanted designs
	const filteredDesigns = selectedDesigns.filter( ( design ) =>
		selectedDesignSlugs.includes( design.slug )
	);

	// Now order the filtered set based on the supplied slugs.
	selectedDesigns = selectedDesignSlugs
		.map( ( selectedDesignSlug ) =>
			filteredDesigns.find( ( design ) => design.slug === selectedDesignSlug )
		)
		.filter( ( selectedDesign ) => !! selectedDesign ) as Design[];

	return selectedDesigns;
};

const getLinkInBioDesigns = ( allDesigns: StarterDesigns ) => {
	const designs =
		allDesigns?.designs.filter(
			( design ) =>
				design.is_virtual &&
				design.categories.some( ( category ) => category.slug === 'link-in-bio' )
		) ?? [];

	return designs;
};

const getCarouselDesktopOptions = (
	flow: string | null | undefined,
	isLargerThan1440px: boolean
) => {
	switch ( true ) {
		case flow === ECOMMERCE_FLOW:
			return {
				w: isLargerThan1440px ? 1920 : 1280,
				vpw: 1920,
				vph: 1280,
				format: 'png',
			};
		default:
			return;
	}
};

const getFlowDesigns = (
	allDesigns: StarterDesigns | undefined,
	flow: string | null | undefined
) => {
	if ( ! allDesigns ) {
		return null;
	}

	switch ( true ) {
		case isLinkInBioFlow( flow ):
			return getLinkInBioDesigns( allDesigns );
		case flow === ECOMMERCE_FLOW:
			return getEcommerceDesigns( allDesigns );
		default:
			return allDesigns?.designs;
	}
};

const DesignCarousel: Step = function DesignCarousel( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const locale = useLocale();
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const isLargerThan1440px = useMediaQuery( '(min-width: 1440px)' );
	const { data: allDesigns } = useStarterDesignsQuery( {
		_locale: locale,
	} );

	function pickDesign( _selectedDesign: Design ) {
		setSelectedDesign( _selectedDesign );
		submit?.( { theme: _selectedDesign?.slug, theme_type: _selectedDesign?.design_type } );
	}

	return (
		<StepContainer
			stepName="designCarousel"
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout
			stepContent={
				<AsyncLoad
					require="@automattic/design-carousel"
					placeholder={ null }
					onPick={ pickDesign }
					selectedDesigns={ getFlowDesigns( allDesigns, flow ) }
					onlyDisplayMobileCarousel={ shouldOnlyDisplayMobileCarousel( flow ) }
					carouselDesktopOptions={ getCarouselDesktopOptions( flow, isLargerThan1440px ) }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id="seller-step-header"
					headerText={ __( 'Choose a design to start' ) }
					align="center"
				/>
			}
		/>
	);
};

export default DesignCarousel;
