/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import Gridicon from 'calypso/components/gridicon';
import QueryPreferences from 'calypso/components/data/query-preferences';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';

const JetpackReviewPrompt: FunctionComponent = () => {
	const translate = useTranslate();
	const hasReceivedRemotePreferences = useSelector( ( state ) =>
		getHasReceivedRemotePreferences( state )
	);
	return (
		<>
			<QueryPreferences />
			{ hasReceivedRemotePreferences && (
				<div className="review-prompt">
					<div className="review-prompt__header">
						<RewindFlowNotice
							gridicon="star"
							type={ RewindFlowNoticeLevel.REMINDER }
							title={ translate( 'Had an easy restore experience?' ) }
						/>
					</div>
					<div className="review-prompt__button-row">
						<Button
							href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
							target="_blank"
						>
							<Gridicon icon="external" />
							{ translate( 'Leave Jetpack a review' ) }
						</Button>
						<Button>
							<Gridicon icon="cross" />
							{ translate( 'No thanks' ) }
						</Button>
					</div>
				</div>
			) }
		</>
	);
};

export default JetpackReviewPrompt;
