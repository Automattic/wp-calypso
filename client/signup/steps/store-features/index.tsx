import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import paymentBlocksImage from 'calypso/assets/images/onboarding/payment-blocks.svg';
import wooImage from 'calypso/assets/images/onboarding/woo.png';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { shoppingBag, truck } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
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
	const subHeaderText = translate( "Let's create a website that suits your needs" );

	const { stepName } = props;

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	const intents: SelectItem< any >[] = [
		{
			key: 'simple',
			title: translate( 'Start Simple' ),
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
							{ translate( 'Powered by' ) } <button>Payment Blocks</button>
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
						{ translate( 'Requires {{link}}business plan{{/link}} for %(monthlyPrice)s/month', {
							args: {
								monthlyPrice: '$49',
							},
							components: {
								link: <button />,
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
							{ translate( 'Powered by' ) } <button>WooCommerce</button>
						</span>
					</span>
				</>
			),
			icon: truck,
			value: 'power',
			actionText: translate( 'Upgrade' ),
		},
	];

	const onSelect = () => {
		throw new Error( 'Not yet implemented' );
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
