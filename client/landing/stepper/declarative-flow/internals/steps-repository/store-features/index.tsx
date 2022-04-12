/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FEATURE_SIMPLE_PAYMENTS, FEATURE_WOOP } from '@automattic/calypso-products';
import { IntentScreen, StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { useIntents } from 'calypso/signup/steps/store-features/intents';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const trackSupportLinkClick = ( storeType: 'power' | 'simple' ) => {
	recordTracksEvent( 'calypso_signup_store_feature_support_link_click', {
		store_feature: storeType,
	} );
};

/**
 * The store features
 */
const StoreFeatures: Step = function StartingPointStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Set up your store', {
		components: { br: <br /> },
	} );
	const subHeaderText = translate( 'Let’s create a website that suits your needs.' );
	const siteSlug = useSiteSlugParam();
	const site = useSite();
	const hasPaymentsFeature = useSelect( ( select ) =>
		select( SITE_STORE ).hasActiveSiteFeature( site?.ID, FEATURE_SIMPLE_PAYMENTS )
	);
	const hasWooFeature = useSelect( ( select ) =>
		select( SITE_STORE ).hasActiveSiteFeature( site?.ID, FEATURE_WOOP )
	);
	const intents = useIntents( siteSlug, hasPaymentsFeature, hasWooFeature, trackSupportLinkClick );
	const { setStoreType } = useDispatch( ONBOARD_STORE );

	const submitIntent = ( storeType: string ) => {
		const providedDependencies = { storeType };
		setStoreType( storeType );
		recordTracksEvent( 'calypso_signup_store_feature_select', { store_feature: storeType } );
		submit?.( providedDependencies, storeType );
	};

	return (
		<StepContainer
			stepName={ 'store-features' }
			goBack={ goBack }
			skipLabelText={ translate( 'Skip to dashboard' ) }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'intent-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={
				<IntentScreen
					intents={ intents }
					intentsAlt={ [] }
					onSelect={ submitIntent }
					preventWidows={ preventWidows }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default StoreFeatures;
