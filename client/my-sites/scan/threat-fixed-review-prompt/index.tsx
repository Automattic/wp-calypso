/**
 * External dependencies
 */
import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import Gridicon from 'calypso/components/gridicon';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { dismiss } from 'calypso/state/jetpack-review-prompt/actions';
import {
	getIsValid,
	getIsDismissed,
	getExistingPreference,
} from 'calypso/state/jetpack-review-prompt/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const ThreatFixedReviewPrompt: React.FC = () => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const isReviewPromptValid = useSelector( ( state ) => getIsValid( state, 'scan' ) );
	const isReviewPromptDismissed = useSelector( ( state ) => getIsDismissed( state, 'scan' ) );
	const lastThreatFixedDate = useSelector(
		( state ) => getExistingPreference( state, 'scan' )?.validFrom
	);

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_scan_review_prompt_view' ) );
	}, [ dispatch ] );

	const dismissPrompt = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_scan_review_prompt_dismiss', {
				reviewed: false,
			} )
		);
		dispatch( dismiss( 'scan', Date.now() ) );
	}, [ dispatch ] );

	const dismissPromptAsReviewed = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_scan_review_prompt_dismiss', {
				reviewed: true,
			} )
		);
		dispatch( dismiss( 'scan', Date.now(), true ) );
	}, [ dispatch ] );

	return isReviewPromptValid && ! isReviewPromptDismissed ? (
		<>
			<QueryPreferences />
			<div className="threat-fixed-review-prompt">
				<div className="threat-fixed-review-prompt__header">
					<p>
						{ translate( 'Scan fixed all threats {{strong}}%s{{/strong}}. Your site looks great!', {
							args: [ moment.utc( lastThreatFixedDate ).fromNow() ],
							components: {
								strong: <strong />,
							},
						} ) }
						<br />
						{ preventWidows(
							translate(
								'Are you happy with Jetpack Scan? Please leave a review and help us spread the word!'
							)
						) }
					</p>
					<Button onClick={ dismissPrompt }>
						<Gridicon icon="cross" />
					</Button>
				</div>
				<div className="threat-fixed-review-prompt__buttons">
					<Button
						href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
						target="_blank"
						onClick={ dismissPromptAsReviewed }
					>
						{ translate( 'Leave a review' ) } <Gridicon icon="external" />
					</Button>
				</div>
			</div>
		</>
	) : null;
};

export default ThreatFixedReviewPrompt;
