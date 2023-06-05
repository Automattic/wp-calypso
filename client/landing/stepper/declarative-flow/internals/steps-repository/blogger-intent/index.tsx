import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

import './style.scss';

const BlogIntent: Step = function BlogIntent() {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'Create your blog' ) } />
			<StepContainer
				stepName="intent"
				isFullLayout
				hideFormattedHeader
				hideBack={ true }
				hideSkip={ true }
				hideNext={ true }
				skipButtonAlign="top"
				showJetpackPowered={ true }
				stepContent={
					<div>
						<h1>Let's start your blog</h1>
						<a href="/setup/start-writing">Start Writing</a>
						<a href="/setup/design-first">View designs</a>
					</div>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default BlogIntent;
