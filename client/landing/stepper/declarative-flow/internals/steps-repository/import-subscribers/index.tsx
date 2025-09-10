import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import {
	StepStatus,
	usePaidNewsletterQuery,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import Subscribers from 'calypso/my-sites/importer/newsletter/subscribers';
import type { StepProps } from '../../types';
import './style.scss';

const ImportSubscribers: React.FC< StepProps > = function ( { navigation } ) {
	const translate = useTranslate();
	const { submit } = navigation;
	const { site, siteSlug } = useSiteData();
	const query = useQuery();
	const [ autoFetchData, setAutoFetchData ] = useState( false );

	const step = 'subscribers';
	const engine = 'substack';

	const { data: paidNewsletterData } = usePaidNewsletterQuery(
		engine,
		step,
		site?.ID,
		autoFetchData
	);

	const fromSite = query.get( 'from' ) || '';
	const status = ( query.get( 'status' ) || 'initial' ) as StepStatus;

	const handleSkipNextStep = () => {
		submit?.();
	};

	if ( ! site ) {
		return null;
	}

	return (
		<Step.CenteredColumnLayout
			className="import-subscribers"
			columnWidth={ 6 }
			heading={
				<Step.Heading
					text={ translate( 'Import your subscribers' ) }
					subText={ translate( 'Bring your existing audience to your new WordPress.com site.' ) }
				/>
			}
		>
			<div className="import-subscribers__content">
				<Subscribers
					cardData={ paidNewsletterData?.steps[ step ]?.content }
					engine="substack"
					fromSite={ fromSite }
					nextStepUrl=""
					selectedSite={ site }
					setAutoFetchData={ setAutoFetchData }
					siteSlug={ siteSlug || '' }
					skipNextStep={ handleSkipNextStep }
					status={ status }
				/>
			</div>
		</Step.CenteredColumnLayout>
	);
};

export default ImportSubscribers;
