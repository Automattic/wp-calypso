import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooImage from 'calypso/assets/images/onboarding/woo.png';
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
	const headerText = translate( 'Setup your store' );
	const subHeaderText = translate( "Let's create a website that suits your needs." );
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
					<span>
						{ translate(
							'Ideal if you’re looking to accept donations or sell one or two products without needing to manage shipping.'
						) }
					</span>
					<span className="store-features__powered-by">
						<span className="store-features__image-wrapper">
							<img src={ paymentBlocksImage } alt="Payment Blocks" />
						</span>
						<span>
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
						</span>
					</span>
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
					<span>
						{ translate(
							'If you have multiple products or require extensive order and shipping management than this might suit your needs better.'
						) }
					</span>
					<span className="store-features__powered-by">
						<span className="store-features__image-wrapper">
							<img src={ wooImage } alt="WooCommerce" />
						</span>
						<span>
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
						</span>
					</span>
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
				page.redirect( `/start/woocommerce-install/confirm?site=${ siteSlug }` );
				break;

			case 'simple':
				throw new Error( 'Not yet implemented' );
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
