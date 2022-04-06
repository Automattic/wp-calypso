import { FEATURE_SIMPLE_PAYMENTS, FEATURE_WOOP } from '@automattic/calypso-products';
import { SelectItems } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { EXCLUDED_STEPS } from '../intent/index';
import { useIntents } from './intents';
import { StoreFeatureSet } from './types';
import type { Dependencies } from 'calypso/signup/types';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
	siteId: number;
}

export default function StoreFeaturesStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const headerText = translate( 'Set up your store' );
	const subHeaderText = translate( 'Let’s create a website that suits your needs.' );
	const siteSlug = props.signupDependencies.siteSlug;
	const { stepName, goToNextStep } = props;

	/**
	 * In the regular flow the "EXCLUDED_STEPS" are already excluded,
	 * but this information is lost if the user leaves the flow and comes back,
	 * e.g. they go to "More Power" and then click "Back"
	 */
	const branchSteps = useBranchSteps( stepName, () => EXCLUDED_STEPS.sell );
	branchSteps( EXCLUDED_STEPS.sell );

	/**
	 * Branch steps to skip design selection for WooCommerce flow
	 */
	const EXCLUDED_STORE_STEPS: { [ key: string ]: string[] } = {
		power: [ 'design-setup-site' ],
		simple: [],
	};
	const getExcludedSteps = ( providedDependencies?: Dependencies ) =>
		EXCLUDED_STORE_STEPS[ providedDependencies?.storeType ];
	const branchStoreSteps = useBranchSteps( stepName, getExcludedSteps );

	const submitStoreFeatures = ( storeType: StoreFeatureSet ) => {
		const providedDependencies = { storeType };
		branchStoreSteps( providedDependencies );
		recordTracksEvent( 'calypso_signup_store_feature_select', {
			store_feature: storeType,
		} );
		dispatch( submitSignupStep( { stepName }, providedDependencies ) );
		goToNextStep();
	};

	const trackSupportLinkClick = ( storeType: StoreFeatureSet ) => {
		recordTracksEvent( 'calypso_signup_store_feature_support_link_click', {
			store_feature: storeType,
		} );
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	const hasPaymentsFeature = useSelector( ( state ) =>
		hasActiveSiteFeature( state, props.siteId, FEATURE_SIMPLE_PAYMENTS )
	);
	const hasWooFeature = useSelector( ( state ) =>
		hasActiveSiteFeature( state, props.siteId, FEATURE_WOOP )
	);
	const intents = useIntents( siteSlug, hasPaymentsFeature, hasWooFeature, trackSupportLinkClick );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			headerImageUrl={ null }
			stepContent={
				<>
					<QuerySiteFeatures siteId={ props.siteId } />
					<SelectItems
						items={ intents }
						onSelect={ submitStoreFeatures }
						preventWidows={ preventWidows }
					/>
				</>
			}
			align={ 'left' }
			hideSkip={ true }
			isHorizontalLayout={ true }
			defaultDependencies={ {
				siteTitle: '',
				tagline: '',
			} }
			{ ...props }
		/>
	);
}
