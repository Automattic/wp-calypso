import { Button, Gridicon } from '@automattic/components';
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
				hideBack={ true }
				hideSkip={ true }
				hideNext={ true }
				showJetpackPowered={ true }
				stepContent={
					<div className="blogger-intent__container">
						<h1 className="blogger-intent__heading">{ translate( "Let's start your blog!" ) }</h1>
						<div className="blogger-intent__content">
							<div className="blogger-intent__row">
								<div className="blogger-intent__row-text">
									<Gridicon icon="pencil" />
									{ translate( 'Write your first post' ) }
								</div>
								<Button primary className="blogger-intent__button" href="/setup/start-writing">
									{ translate( 'Start Writing' ) }
								</Button>
							</div>
							<hr />
							<div className="blogger-intent__row">
								<div className="blogger-intent__row-text">
									<Gridicon icon="layout" />
									{ translate( 'Pick a design first' ) }
								</div>
								<Button primary className="blogger-intent__button" href="/setup/design-first">
									{ translate( 'View designs' ) }
								</Button>
							</div>
						</div>
					</div>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default BlogIntent;
