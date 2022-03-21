import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { IntentScreen } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import difmImage from 'calypso/assets/images/difm/difm.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { preventWidows } from 'calypso/lib/formatting';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	getProductDisplayCost,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import { removeSiteSlugDependency } from 'calypso/state/signup/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { award, headset } from '../../icons';
import { ChoiceType } from './types';
import type { SelectItem } from '@automattic/onboarding';

import './style.scss';

interface Props {
	goToNextStep: () => void;
	submitSignupStep: ( { stepName, wasSkipped }: { stepName: string; wasSkipped: boolean } ) => void;
	goToStep: ( stepName: string ) => void;
	stepName: string;
}

type NewOrExistingSiteIntent = SelectItem< ChoiceType >;

const Placeholder = () => <span className="new-or-existing-site__placeholder">&nbsp;</span>;

export default function NewOrExistingSiteStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const displayCost = useSelector( ( state ) => getProductDisplayCost( state, WPCOM_DIFM_LITE ) );
	const isLoading = useSelector( isProductsListFetching );

	const headerText = translate( 'Do It For Me' );

	const subHeaderText = translate(
		'Get a professionally designed, mobile-optimized website in %(fulfillmentDays)d business days or less for a one-time fee of {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}} plus a one year subscription of the Premium plan.',
		{
			args: {
				displayCost,
				fulfillmentDays: 4,
			},
			components: {
				PriceWrapper: isLoading ? <Placeholder /> : <strong />,
			},
		}
	);

	const intents: NewOrExistingSiteIntent[] = [
		{
			key: 'new-site',
			title: translate( 'New site' ),
			description: (
				<p>
					{ translate(
						'Start fresh. We will build your new site from scratch using the content you provide in the following steps.'
					) }
				</p>
			),
			icon: award,
			value: 'new-site',
			actionText: translate( 'Start a new site' ),
		},
		{
			key: 'existing-site',
			title: translate( 'Existing WordPress.com site' ),
			description: (
				<p>
					{ translate(
						'Use an existing site. Any existing content will be deleted, but you will be able to submit your content for your new site in later steps.'
					) }
				</p>
			),
			icon: headset,
			value: 'existing-site',
			actionText: translate( 'Select a site' ),
		},
	];

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const branchSteps = useBranchSteps( props.stepName, () => [ 'difm-site-picker' ] );

	const newOrExistingSiteSelected = ( value: ChoiceType ) => {
		// If 'new-site' is selected, skip the `difm-site-picker` step.
		if ( 'new-site' === value ) {
			branchSteps( {} );
			dispatch( removeSiteSlugDependency() );
		}
		dispatch(
			submitSignupStep(
				{ stepName: props.stepName },
				{
					newOrExistingSiteChoice: value,
					forceAutoGeneratedBlogName: true,
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
						onSelect={ newOrExistingSiteSelected }
						preventWidows={ preventWidows }
						intentsAlt={ [] }
					/>
				}
				align={ 'left' }
				hideSkip
				isHorizontalLayout={ true }
				isWideLayout={ true }
				headerImageUrl={ difmImage }
				{ ...props }
			/>
		</>
	);
}
