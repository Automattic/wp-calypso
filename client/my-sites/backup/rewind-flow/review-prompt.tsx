/**
 * External dependencies
 */
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import Gridicon from 'calypso/components/gridicon';
import QueryPreferences from 'calypso/components/data/query-preferences';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import {
	getIsDismissed,
	getHasBeenDismissedOnce,
} from 'calypso/state/jetpack-review-prompt/selectors';
import {
	dismissReviewPrompt,
	dismissReviewPromptPermanently,
} from 'calypso/state/jetpack-review-prompt/actions';

const JetpackReviewPrompt: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasReceivedRemotePreferences = useSelector( ( state ) =>
		getHasReceivedRemotePreferences( state )
	);
	const isDismissed = useSelector( ( state ) => getIsDismissed( state ) );
	const hasBeenDismissedOnce = useSelector( ( state ) => getHasBeenDismissedOnce( state ) );

	const dismiss = useCallback( () => {
		dispatch( hasBeenDismissedOnce ? dismissReviewPromptPermanently() : dismissReviewPrompt() );
	}, [ dispatch, hasBeenDismissedOnce ] );

	return (
		<>
			<QueryPreferences />
			{ hasReceivedRemotePreferences && ! isDismissed && (
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
							onClick={ dismiss }
						>
							<Gridicon icon="external" />
							{ translate( 'Leave Jetpack a review' ) }
						</Button>
						<Button onClick={ dismiss }>
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
