import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { ReactNode } from 'react';
import { ClickHandler } from 'calypso/components/step-progress';
import {
	PaidNewsletterData,
	StepStatus,
	Steps,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { navigate } from 'calypso/lib/navigate';

function getStepProgressIndicator( stepStatus?: StepStatus ): ReactNode {
	if ( stepStatus === 'done' ) {
		return <Icon icon={ check } />;
	}

	if ( stepStatus === 'importing' ) {
		return <Spinner style={ { color: '#3858e9' } } />;
	}
}

export function getStepsProgress(
	engine: string,
	selectedSiteSlug: string,
	paidNewsletterData?: PaidNewsletterData
) {
	const summaryStatus = getImporterStatus( paidNewsletterData?.steps );

	const result: ClickHandler[] = [
		{
			message: __( 'Content' ),
			onClick: () => {
				navigate( `/import/newsletter/${ engine }/${ selectedSiteSlug }/content` );
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps?.content?.status ),
		},
		{
			message: __( 'Subscribers' ),
			onClick: () => {
				navigate( `/import/newsletter/${ engine }/${ selectedSiteSlug }/subscribers` );
			},
			show: 'onComplete',
			indicator: getStepProgressIndicator( paidNewsletterData?.steps?.subscribers?.status ),
		},
		{
			message: __( 'Summary' ),
			onClick: () => {
				navigate( `/import/newsletter/${ engine }/${ selectedSiteSlug }/summary` );
			},
			show: summaryStatus === 'done' || summaryStatus === 'skipped' ? 'always' : 'onComplete',
			indicator: getStepProgressIndicator( summaryStatus === 'done' ? 'done' : 'initial' ),
		},
	];

	return result;
}

/*
 * Gather entire engine's status by combining "content" and "subscribers" steps status
 */
export function getImporterStatus( steps?: Steps ): StepStatus {
	// Initialize both statuses to 'initial' if undefined.
	const content = steps?.content?.status || 'initial';
	const contentImportStatus = steps?.content?.content?.importStatus;
	const subscribers = steps?.subscribers?.status || 'initial';

	if ( content === 'done' && subscribers === 'done' ) {
		return 'done';
	}

	if ( content === 'done' && subscribers === 'skipped' ) {
		return 'done';
	}

	if ( content === 'skipped' && subscribers === 'done' ) {
		return 'done';
	}

	if ( content === 'skipped' && subscribers === 'skipped' ) {
		return 'skipped';
	}

	if ( content === 'skipped' && subscribers === 'pending' ) {
		return 'importing';
	}

	if ( content === 'importing' || subscribers === 'importing' ) {
		return 'importing';
	}

	if ( contentImportStatus === 'importExpired' ) {
		return 'expired';
	}

	return 'initial';
}

export function normalizeFromSite( fromSite: string ) {
	if ( ! fromSite ) {
		return '';
	}
	const result = fromSite.match( /\/@(?<slug>\w+)$/ );
	if ( result?.groups?.slug ) {
		return result.groups.slug + '.substack.com';
	}

	return fromSite;
}
