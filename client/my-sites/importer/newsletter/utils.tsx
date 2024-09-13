import { Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { ReactNode } from 'react';
import { ClickHandler } from 'calypso/components/step-progress';
import {
	PaidNewsletterData,
	StepStatus,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { navigate } from 'calypso/lib/navigate';

const noop = () => {};

function getStepProgressIndicator( stepStatus?: StepStatus ): ReactNode {
	if ( stepStatus === 'done' ) {
		return <Icon icon={ check } />;
	}

	if ( stepStatus === 'importing' ) {
		return <Spinner style={ { color: '#3858e9' } } />;
	}
}

export function getSetpProgressSteps(
	engine: string,
	selectedSiteSlug: string,
	fromSite: string,
	paidNewsletterData?: PaidNewsletterData
) {
	const result: ClickHandler[] = [
		{
			message: 'Content',
			onClick: () => {
				navigate(
					addQueryArgs( `/import/newsletter/${ engine }/${ selectedSiteSlug }/content`, {
						from: fromSite,
					} )
				);
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps.content.status ),
		},
		{
			message: 'Subscribers',
			onClick: () => {
				navigate(
					addQueryArgs( `/import/newsletter/${ engine }/${ selectedSiteSlug }/subscribers`, {
						from: fromSite,
					} )
				);
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps.subscribers.status ),
		},
		{
			message: 'Summary',
			onClick: noop,
		},
	];

	return result;
}
