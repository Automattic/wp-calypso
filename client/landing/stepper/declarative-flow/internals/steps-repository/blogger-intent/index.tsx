import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { DesignIcon, FeatherIcon } from './icons';
import type { Step } from '../../types';
import type { UserSelect } from '@automattic/data-stores';

import './style.scss';

const BlogIntent: Step = function BlogIntent() {
	const translate = useTranslate();

	const handleButtonClick = ( intent: string ) => {
		recordTracksEvent( 'calypso_blog_onboarding_selection_button_click', {
			intent: intent,
		} );
	};

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	const username = currentUser?.display_name ?? currentUser?.username;

	return (
		<>
			<DocumentHead title={ translate( 'Create your blog' ) } />
			<StepContainer
				stepName="intent"
				hideBack
				hideSkip
				hideNext
				showJetpackPowered
				stepContent={
					<div className="blogger-intent__container">
						<h2 className="blogger-intent__heading">
							{ username
								? translate( "Let's start your blog, %(username)s!", {
										args: { username },
								  } )
								: translate( "Let's start your blog!" ) }
						</h2>
						<div className="blogger-intent__content">
							<div className="blogger-intent__row">
								<div className="blogger-intent__row-text">
									<FeatherIcon />
									{ translate( 'Write your first post' ) }
								</div>
								<Button
									onClick={ () => handleButtonClick( 'start-writing' ) }
									className="blogger-intent__button"
									primary
									href="/setup/start-writing"
								>
									{ translate( 'Start writing' ) }
								</Button>
							</div>
							<hr />
							<div className="blogger-intent__row">
								<div className="blogger-intent__row-text">
									<DesignIcon />
									{ translate( 'Pick a design first' ) }
								</div>
								<Button
									onClick={ () => handleButtonClick( 'design-first' ) }
									className="blogger-intent__button"
									primary
									href="/setup/design-first"
								>
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
