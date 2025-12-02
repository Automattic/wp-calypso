import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { ReactNode } from 'react';
import { ClickHandler } from 'calypso/components/step-progress';
import {
	PaidNewsletterData,
	StepStatus,
	StepId,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { getImporterStatus } from 'calypso/my-sites/importer/newsletter/utils';

type SetStep = ( step: StepId ) => void;

function getStepProgressIndicator( stepStatus?: StepStatus ): ReactNode {
	if ( stepStatus === 'done' ) {
		return <Icon icon={ check } />;
	}

	if ( stepStatus === 'importing' ) {
		return <Spinner style={ { color: '#3858e9' } } />;
	}
}

export function getStepsProgress(
	setStep: SetStep,
	paidNewsletterData?: PaidNewsletterData | undefined
) {
	const summaryStatus = getImporterStatus( paidNewsletterData?.steps );

	const result: ClickHandler[] = [
		{
			message: __( 'Content' ),
			onClick: () => {
				setStep( 'content' );
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps?.content?.status ),
		},
		{
			message: __( 'Subscribers' ),
			onClick: () => {
				setStep( 'subscribers' );
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps?.subscribers?.status ),
		},
		{
			message: __( 'Summary' ),
			onClick: () => {
				setStep( 'summary' );
			},
			show: summaryStatus === 'done' || summaryStatus === 'skipped' ? 'always' : 'onComplete',
			indicator: getStepProgressIndicator( summaryStatus === 'done' ? 'done' : 'initial' ),
		},
	];

	return result;
}
