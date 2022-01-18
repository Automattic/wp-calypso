import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { tip } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

export default function SellOptionsStep( props: Props ): React.ReactNode {
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
					{ translate(
						"Ideal if you're looking to sell one or two products and don't need order management."
					) }
					<span className="sell-options__powered-by">
						Powered by <button>Payment Blocks</button>
					</span>
				</>
			),
			icon: tip,
			value: 'simple',
			actionText: translate( 'Start' ),
		},
		{
			key: 'power',
			title: translate( 'More Power' ),
			description: (
				<>
					{ translate(
						'If you have multiple products or require shipment tracking we recommend starting here.'
					) }
					<span className="sell-options__powered-by">
						Powered by <button>WooCommerce</button>
					</span>
				</>
			),
			icon: tip,
			value: 'power',
			actionText: translate( 'Start' ),
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
			skipButtonAlign={ 'top' }
			skipLabelText={ translate( 'Skip this step' ) }
			isHorizontalLayout={ true }
			defaultDependencies={ {
				siteTitle: '',
				tagline: '',
			} }
			{ ...props }
		/>
	);
}
