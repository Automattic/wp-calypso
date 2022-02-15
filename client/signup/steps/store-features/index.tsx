import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { localizeUrl } from 'calypso/lib/i18n-utils/utils';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { shoppingBag, truck } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import { EXCLUDED_STEPS } from '../intent/index';
import { StoreFeatureSet } from './types';
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

	const onSelect = ( selectedOption: StoreFeatureSet ) => {
		recordTracksEvent( 'calypso_signup_store_feature_select', {
			store_feature: selectedOption,
		} );
		switch ( selectedOption ) {
			case 'power':
				page(
					addQueryArgs( `/start/woocommerce-install`, {
						back_to: `/start/setup-site/store-features?siteSlug=${ siteSlug }`,
						siteSlug: siteSlug,
					} )
				);
				break;

			case 'simple': {
				dispatch( submitSignupStep( { stepName } ) );
				goToNextStep();
			}
		}
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			headerImageUrl={ null }
			stepContent={ <SelectItems items={ intents } onSelect={ onSelect } /> }
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
