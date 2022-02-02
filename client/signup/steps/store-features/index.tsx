import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { localizeUrl } from 'calypso/lib/i18n-utils/utils';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { shoppingBag, truck } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import { StoreFeatureSet } from './types';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

export default function StoreFeaturesStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const headerText = translate( 'Set up your store' );
	const subHeaderText = translate( 'Let’s create a website that suits your needs.' );
	const siteSlug = props.signupDependencies.siteSlug;

	const { stepName } = props;

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
					<span className="store-features__requirements">{ translate( 'Free' ) }</span>

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
			title: translate( 'More Power' ),
			description: (
				<>
					<span className="store-features__requirements">
						{ translate( 'Requires a {{a}}Business plan{{/a}}', {
							components: {
								a: <a href="/plans/" />,
							},
						} ) }
					</span>

					<p>
						{ translate(
							'If you have multiple products or require extensive order and shipping management than this might suit your needs better.'
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
		switch ( selectedOption ) {
			case 'power':
				page.redirect( `/start/woocommerce-install/?site=${ siteSlug }` );
				break;

			case 'simple':
				//@TODO: assign the Zoologist theme
				page.redirect( `/site-editor/${ siteSlug }/` );
				break;
		}
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			headerImageUrl={ intentImageUrl }
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
