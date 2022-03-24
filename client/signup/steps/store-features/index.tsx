import { localizeUrl } from '@automattic/i18n-utils';
import { SelectItem, SelectItems } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { shoppingBag, truck } from '../../icons';
import { EXCLUDED_STEPS } from '../intent/index';
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

	const sitePlanSlug = useSelector( ( state ) => getSite( state, siteSlug )?.plan?.product_slug );

	const isPaidPlan = sitePlanSlug !== 'free_plan';

	let isBusinessOrEcommercePlan;

	switch ( sitePlanSlug ) {
		case 'business-bundle':
		case 'ecommerce-bundle':
			isBusinessOrEcommercePlan = true;
			break;

		default:
			isBusinessOrEcommercePlan = false;
	}

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	const intents: SelectItem< StoreFeatureSet >[] = [
		{
			key: 'simple',
			title: translate( 'Start simple' ),
			description: (
				<>
					<span className="store-features__requirements">
						{ isPaidPlan
							? translate( 'Included in your plan' )
							: translate( 'Requires a {{a}}paid plan{{/a}}', {
									components: {
										a: <a href={ `/plans/${ siteSlug }` } />,
									},
							  } ) }
					</span>

					<p>
						{ translate(
							'Ideal if you’re looking to accept donations or sell one or two products without needing to manage shipping.'
						) }
					</p>

					<footer className="store-features__powered-by">
						<img
							src={ paymentBlocksImage }
							alt="Payment Blocks"
							className="store-features__feature-icon"
						/>

						{ translate( 'Powered by {{a}}Payment Blocks{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/wordpress-editor/blocks/payments/'
										) }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () => trackSupportLinkClick( 'simple' ) }
									/>
								),
							},
						} ) }
					</footer>
				</>
			),
			icon: shoppingBag,
			value: 'simple',
			actionText: translate( 'Continue' ),
		},
		{
			key: 'power',
			title: translate( 'More power' ),
			description: (
				<>
					<span className="store-features__requirements">
						{ isBusinessOrEcommercePlan
							? translate( 'Included in your plan' )
							: translate( 'Requires a {{a}}Business plan{{/a}}', {
									components: {
										a: <a href={ `/plans/${ siteSlug }` } />,
									},
							  } ) }
					</span>

					<p>
						{ translate(
							'If you have multiple products or require extensive order and shipping management then this might suit your needs better.'
						) }
					</p>

					<footer className="store-features__powered-by">
						<img
							src={ wooCommerceImage }
							alt="WooCommerce"
							className="store-features__feature-icon"
						/>

						{ translate( 'Powered by {{a}}WooCommerce{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/introduction-to-woocommerce/'
										) }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () => trackSupportLinkClick( 'power' ) }
									/>
								),
							},
						} ) }
					</footer>
				</>
			),
			icon: truck,
			value: 'power',
			actionText: translate( 'Upgrade' ),
		},
	];

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			headerImageUrl={ null }
			stepContent={
				<SelectItems
					items={ intents }
					onSelect={ submitStoreFeatures }
					preventWidows={ preventWidows }
				/>
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
