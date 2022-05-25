import { getPlan, PLAN_WPCOM_PRO, WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { IntentScreen } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { preventWidows } from 'calypso/lib/formatting';
import StepWrapper from 'calypso/signup/step-wrapper';
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
			description: translate(
				'Get a professionally designed, mobile-optimized website in %(fulfillmentDays)d business days or less for a one-time fee of {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}} plus a one year subscription of the %(plan)s plan.',
				{
					args: {
						displayCost,
						fulfillmentDays: 4,
						plan: getPlan( PLAN_WPCOM_PRO )?.getTitle(),
					},
					components: {
						PriceWrapper: isLoading ? <Placeholder /> : <strong />,
					},
				}
			),
			icon: mouse,
			value: 'difm',
			actionText: translate( 'Get Started' ),
			isPrimary: true,
		},
		{
			key: 'builtby',
			title: translate( 'Built by WordPress.com - Concierge' ),
			description: translate(
				'Perfect for those looking for advanced features (e.g., e-commerce, migrations), customized designs, or who prefer a custom, consultative experience.'
			),
			icon: headset,
			value: 'builtby',
			actionText: translate( 'Learn More' ),
		},
	];

	useEffect( () => {
		if ( ! props.queryObject.siteSlug && ! props.queryObject.siteId ) {
			throw new Error(
				'website-design-services did not provide the site slug or site id it is configured to.'
			);
		}
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				backUrl={ `/setup/intent?siteSlug=${ props.queryObject.siteSlug }` }
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
