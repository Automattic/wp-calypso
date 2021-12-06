import { isEnabled } from '@automattic/calypso-config';
import DesignPicker, {
	FeaturedPicksButtons,
	getAvailableDesigns,
	useCategorization,
} from '@automattic/design-picker';
import { useLocale, englishLocales } from '@automattic/i18n-utils';
import { Title, SubTitle, ActionButtons, BackButton } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useMemo } from 'react';
import * as React from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import Badge from '../../components/badge';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import type { Design, Category } from '@automattic/design-picker';

import './style.scss';

// Ensures Blog category appears at the top of the design category list
// (directly below the All Themes category).
const sortBlogToTop = ( a: Category, b: Category ) => {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'blog' ) {
		return -1;
	} else if ( b.slug === 'blog' ) {
		return 1;
	}
	return 0;
};

const Header: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const isAnchorFmSignup = useIsAnchorFm();
	const isDesignPickerCategoriesEnabled =
		! isAnchorFmSignup && isEnabled( 'signup/design-picker-categories' );

	const { goBack } = useStepNavigation();
	const title = isDesignPickerCategoriesEnabled ? __( 'Themes' ) : __( 'Choose a design' );
	let subTitle = isAnchorFmSignup
		? __( 'Pick a homepage layout for your podcast site. You can customize or change it later.' )
		: __( 'Pick your favorite homepage layout. You can customize or change it later.' );

	if ( isDesignPickerCategoriesEnabled ) {
		subTitle = __( 'Choose a starting theme. You can change it later.' );

		if ( englishLocales.includes( locale ) ) {
			// An English only trick so the line wraps between sentences.
			subTitle = subTitle
				.replace( /\s/g, '\xa0' ) // Replace all spaces with non-breaking spaces
				.replace( /\.\s/g, '. ' ); // Replace all spaces at the end of sentences with a regular breaking space
		}
	}

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
	const { __ } = useI18n();
	const locale = useLocale();
	const { goNext } = useStepNavigation();
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

	// As the amount of the anchorfm related designs is little, we don't need to enable categories filter
	const isDesignPickerCategoriesEnabled =
		! isAnchorFmSignup && isEnabled( 'signup/design-picker-categories' );

	const useFeaturedPicksButtons =
		isDesignPickerCategoriesEnabled &&
		isEnabled( 'signup/design-picker-use-featured-picks-buttons' );

	const allDesigns = getRandomizedDesigns().featured.filter(
		( design ) =>
			// TODO Add finalized design templates to available designs config
			// along with `is_anchorfm` prop (config is stored in the
			// `@automattic/design-picker` package)
			isAnchorFmSignup === design.features.includes( 'anchorfm' )
	);

	const { designs, featuredPicksDesigns } = useMemo(
		() => ( {
			designs: allDesigns.filter( ( theme ) => ! theme.is_featured_picks ),
			featuredPicksDesigns: allDesigns.filter( ( theme ) => theme.is_featured_picks ),
		} ),
		[ allDesigns ]
	);

	const categorization = useCategorization( designs, {
		showAllFilter: isDesignPickerCategoriesEnabled,
		defaultSelection: null,
		sort: sortBlogToTop,
	} );

	useTrackStep( 'DesignSelection', () => ( {
		selected_design: selectedDesign?.slug,
		is_selected_design_premium: hasPaidDesign(),
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
			useFseDesigns: isFse,
			randomize: true,
		} );
		setRandomizedDesigns( availableDesigns );
	}, [ isFse, setRandomizedDesigns ] );

	return (
		<div className="gutenboarding-page designs">
			{ ! isDesignPickerCategoriesEnabled && <Header /> }
			<DesignPicker
				className={ classnames( {
					'designs__has-categories': isDesignPickerCategoriesEnabled,
				} ) }
				designs={ useFeaturedPicksButtons ? designs : allDesigns }
				isGridMinimal={ isAnchorFmSignup }
				locale={ locale }
				onSelect={ onSelect }
				premiumBadge={
					<Badge className="designs__premium-badge">
						<JetpackLogo className="designs__premium-badge-logo" size={ 20 } />
						<span className="designs__premium-badge-text">{ __( 'Premium' ) }</span>
					</Badge>
				}
				categorization={ isDesignPickerCategoriesEnabled ? categorization : undefined }
				categoriesHeading={ isDesignPickerCategoriesEnabled && <Header /> }
				categoriesFooter={
					useFeaturedPicksButtons && (
						<FeaturedPicksButtons
							className="designs__featured-picks-buttons"
							designs={ featuredPicksDesigns }
							onSelect={ onSelect }
						/>
					)
				}
			/>
		</div>
	);
};

export default Designs;
