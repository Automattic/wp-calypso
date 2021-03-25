/**
 * External dependencies
 */
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import { dismiss } from 'calypso/state/jetpack-review-prompt/actions';
import { getIsDismissed } from 'calypso/state/jetpack-review-prompt/selectors';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Gridicon from 'calypso/components/gridicon';
import QueryPreferences from 'calypso/components/data/query-preferences';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';

const JetpackReviewPrompt: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// dismiss count is stored in a preference, make sure we have that before rendering
	const hasReceivedRemotePreferences = useSelector( ( state ) =>
		getHasReceivedRemotePreferences( state )
	);
	const isDismissed = useSelector( ( state ) => getIsDismissed( state, 'restore' ) );

	const dismissPrompt = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_review_prompt_dismiss', {
				reviewed: false,
			} )
		);
		dispatch( dismiss( 'restore', Date.now() ) );
	}, [ dispatch ] );

	const dismissPromptAsReviewed = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_review_prompt_dismiss', {
				reviewed: true,
			} )
		);
		dispatch( dismiss( 'restore', Date.now(), true ) );
	}, [ dispatch ] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_review_prompt_view' ) );
	}, [ dispatch ] );

	return (
		<>
			<QueryPreferences />
			{ hasReceivedRemotePreferences && ! isDismissed && (
				<>
					<hr />
					<div className="jetpack-review-prompt">
						<div className="jetpack-review-prompt__header">
							<RewindFlowNotice
								gridicon="star"
								type={ RewindFlowNoticeLevel.REMINDER }
								title={ translate( 'Had an easy restore experience?' ) }
							/>
						</div>
						<div className="jetpack-review-prompt__button-row">
							<Button
								href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
								target="_blank"
								onClick={ dismissPromptAsReviewed }
							>
								<Gridicon icon="external" />
								{ translate( 'Leave Jetpack a review' ) }
							</Button>
							<Button onClick={ dismissPrompt }>
								<Gridicon icon="cross" />
								{ translate( 'No thanks' ) }
							</Button>
						</div>
					</div>
				</>
			) }
		</>
	);
};

export default JetpackReviewPrompt;
