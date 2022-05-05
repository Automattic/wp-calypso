import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	PLAN_PREMIUM,
	PLAN_WPCOM_PRO,
	WPCOM_DIFM_LITE,
} from '@automattic/calypso-products';
import { IntentScreen } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { preventWidows } from 'calypso/lib/formatting';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import {
	getProductDisplayCost,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { mouse, headset } from '../../icons';
import { ChoiceType } from './types';
import type { SelectItem } from '@automattic/onboarding';

import './style.scss';

interface Props {
	signupDependencies: any;
	existingSiteCount: number;
	goToNextStep: () => void;
	submitSignupStep: ( { stepName, wasSkipped }: { stepName: string; wasSkipped: boolean } ) => void;
	goToStep: ( stepName: string ) => void;
	stepName: string;
	queryObject: {
		siteSlug?: string;
		siteId?: string;
	};
}

type DIFMOrBuiltByIntent = SelectItem< ChoiceType >;

const Placeholder = () => <span className="choose-service__placeholder">&nbsp;</span>;

export default function ChooseServiceStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const displayCost = useSelector( ( state ) => getProductDisplayCost( state, WPCOM_DIFM_LITE ) );
	const isLoading = useSelector( isProductsListFetching );

	const headerText = translate( 'Let our experts create your dream site' );

	const subHeaderText = translate(
		'Get your business up quickly with our experts building your responsive, professional website. Select your best option.'
	);

	const intents: DIFMOrBuiltByIntent[] = [
		{
			key: 'difm',
			title: translate( 'Do It For Me' ),
			description: (
				<p>
					{ translate(
						'Get a professionally designed, mobile-optimized website in %(fulfillmentDays)d business days or less for a one-time fee of {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}} plus a one year subscription of the %(plan)s plan.',
						{
							args: {
								displayCost,
								fulfillmentDays: 4,
								plan: isEnabled( 'plans/pro-plan' )
									? getPlan( PLAN_WPCOM_PRO )?.getTitle()
									: getPlan( PLAN_PREMIUM )?.getTitle(),
							},
							components: {
								PriceWrapper: isLoading ? <Placeholder /> : <strong />,
							},
						}
					) }
				</p>
			),
			icon: mouse,
			value: 'difm',
			actionText: translate( 'Get Started' ),
		},
		{
			key: 'builtby',
			title: translate( 'Built by WordPress.com - Concierge' ),
			description: (
				<p>
					{ translate(
						'Curabitur elementum lectus mi, quis venenatis metus tincidunt ac. Integer non lorem erat.'
					) }
				</p>
			),
			icon: headset,
			value: 'builtby',
			actionText: translate( 'Learn More' ),
		},
	];

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [] );

	const onSelect = ( value: ChoiceType ) => {
		if ( 'builtby' === value ) {
			window.location.href = 'https://builtbywp.com/';
			return;
		}
		dispatch(
			submitSignupStep(
				{ stepName: props.stepName },
				{
					siteSlug: props.queryObject.siteSlug || props.queryObject.siteId,
				}
			)
		);
		props.goToNextStep();
	};

	return (
		<>
			<QueryProductsList persist />
			<StepWrapper
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				stepContent={
					<IntentScreen
						intents={ intents }
						onSelect={ onSelect }
						preventWidows={ preventWidows }
						intentsAlt={ [] }
					/>
				}
				backUrl={ getStepUrl( 'setup-site', 'intent', undefined, '', {
					siteSlug: props.queryObject.siteSlug,
				} ) }
				hideBack={ false }
				allowBackFirstStep={ true }
				align={ 'left' }
				hideSkip
				isHorizontalLayout={ true }
				isWideLayout={ true }
				{ ...props }
			/>
		</>
	);
}
