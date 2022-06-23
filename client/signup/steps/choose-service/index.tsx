import { isEnabled } from '@automattic/calypso-config';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

import './style.scss';

interface Props {
	existingSiteCount: number;
	goToNextStep: () => void;
	goToStep: ( stepName: string ) => void;
	stepName: string;
	queryObject: {
		siteSlug?: string;
		siteId?: string;
	};
}

export default function ChooseServiceStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const isEnabledFTM = isEnabled( 'signup/ftm-flow-non-en' ) || isEnglishLocale;
	const goalsCaptureStepEnabled = isEnabled( 'signup/goals-step' ) && isEnabledFTM;

	const getBackUrl = ( siteSlug?: string ) => {
		const step = goalsCaptureStepEnabled ? 'goals' : 'intent';
		return `/setup/${ step }?siteSlug=${ siteSlug }`;
	};

	const headerText = translate( 'Hire a professional to set up your site.' );
	const subHeaderText = translate( 'Try risk free with a %(days)d-day money back guarantee', {
		args: { days: 14 },
	} );

	useEffect( () => {
		if ( ! props.queryObject.siteSlug && ! props.queryObject.siteId ) {
			throw new Error(
				'website-design-services did not provide the site slug or site id it is configured to.'
			);
		}
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const onSelect = () => {
		dispatch(
			submitSignupStep(
				{ stepName: props.stepName },
				{
					siteSlug: props.queryObject.siteSlug || props.queryObject.siteId,
					newOrExistingSiteChoice: 'existing-site',
				}
			)
		);
		props.goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <DIFMLanding onSubmit={ onSelect } /> }
			backUrl={ getBackUrl( props.queryObject.siteSlug ) }
			hideBack={ false }
			allowBackFirstStep={ true }
			hideSkip
			isHorizontalLayout={ false }
			isWideLayout={ false }
			{ ...props }
		/>
	);
}
