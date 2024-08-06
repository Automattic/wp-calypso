import { StepContainer, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { StepProps } from '../../types';
import './style.scss';

interface Props extends StepProps {}

const PlatformSelection: FC< Props > = () => {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'Where are you coming from?' ) } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="platform_selection"
				stepContent={
					<>
						<Title>{ translate( 'Where are you coming from?' ) }</Title>
						<p>A step content</p>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default PlatformSelection;
