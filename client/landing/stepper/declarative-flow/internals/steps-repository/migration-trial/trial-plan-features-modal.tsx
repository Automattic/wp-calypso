import { JetpackPlan, Plan, WPComPlan } from '@automattic/calypso-products';
import { NextButton } from '@automattic/onboarding';
import { Modal } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';

interface Props {
	plan: Plan | JetpackPlan | WPComPlan | undefined;
	onClose: () => void;
}
export default function TrialPlanFeaturesModal( props: Props ) {
	const { __ } = useI18n();
	const { plan, onClose } = props;

	const title = sprintf(
		/* translators: the planName could be "Pro" or "Business" */
		__( "What's included in the %(planName)s Plan" ),
		{
			planName: plan?.getTitle(),
		}
	);
	const features =
		plan && 'getPlanCompareFeatures' in plan
			? ( plan?.getPlanCompareFeatures?.() || [] )
					.map( ( feature: string ) => getFeatureByKey( feature )?.getTitle() )
					.filter( ( x ) => x )
			: [];

	return (
		<Modal
			className="import__details-modal trial-plan-features-modal"
			title={ title }
			onRequestClose={ () => onClose() }
		>
			<ul className="import__details-list">
				{ features.map( ( feature, i ) => (
					<li className="import__upgrade-plan-feature" key={ i }>
						<Icon size={ 20 } icon={ check } />
						<span>{ feature }</span>
					</li>
				) ) }
			</ul>
			<div className="button-container">
				<NextButton onClick={ () => onClose() }>{ __( 'Continue' ) }</NextButton>
			</div>
		</Modal>
	);
}
