import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import siteVerticalImage from 'calypso/assets/images/onboarding/site-vertical.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useQuery } from '../../../../hooks/use-query';
import SiteVerticalForm from './form';
import type { Step } from '../../types';

const SiteVertical: Step = function SiteVertical( { navigation } ) {
	const { goNext, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'What’s your website about?' );
	const subHeaderText = translate( 'Choose a category that defines your website the best.' );
	const isSkipSynonyms = useQuery().get( 'isSkipSynonyms' );

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			stepName={ 'site-vertical' }
			goNext={ goNext }
			headerImageUrl={ siteVerticalImage }
			skipLabelText={ translate( 'Skip to My Home' ) }
			skipButtonAlign={ 'top' }
			isHorizontalLayout={ true }
			hideBack={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'site-vertical-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={
				<SiteVerticalForm isSkipSynonyms={ Boolean( isSkipSynonyms ) } onSubmit={ handleSubmit } />
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteVertical;
