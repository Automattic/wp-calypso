/**
 * External dependencies
 */
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@wordpress/components';
import { dismiss } from 'calypso/state/jetpack-review-prompt/actions';
import { getIsDismissed } from 'calypso/state/jetpack-review-prompt/selectors';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Gridicon from 'calypso/components/gridicon';
import QueryPreferences from 'calypso/components/data/query-preferences';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	align: 'left' | 'center';
	type: 'scan' | 'restore';
}

const JetpackReviewPrompt: FunctionComponent< Props > = ( { align = 'center', type } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// dismiss count is stored in a preference, make sure we have that before rendering
	const hasReceivedRemotePreferences = useSelector( ( state ) =>
		getHasReceivedRemotePreferences( state )
	);

	const isDismissed = useSelector( ( state ) => getIsDismissed( state, type ) );
	// const isValidFrom

	const dismissPrompt = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_review_prompt_dismiss', {
				reviewed: false,
				type,
			} )
		);
		dispatch( dismiss( type, Date.now() ) );
	}, [ dispatch, type ] );

	const dismissPromptAsReviewed = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_review_prompt_dismiss', {
				reviewed: true,
				type,
			} )
		);
		dispatch( dismiss( type, Date.now(), true ) );
	}, [ dispatch, type ] );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_review_prompt_view', {
				type,
			} )
		);
	}, [ dispatch, type ] );

	const text = () => {
		switch ( type ) {
			case 'restore':
				return translate(
					'Was it easy to restore your site? Leave us a review and help spread the word'
				);
			case 'scan':
			default:
				return translate(
					'Are you happy with Jetpack Scan? Leave us a review and help spread the word'
				);
		}
	};

	const topClass = () => {
		switch ( align ) {
			case 'left':
				return 'jetpack-review-prompt__left';
			default:
			case 'center':
				return 'jetpack-review-prompt';
		}
	};

	return (
		<>
			<QueryPreferences />
			{ hasReceivedRemotePreferences && ! isDismissed && (
				<Card className={ topClass() }>
					<div className="jetpack-review-prompt__header">
						<h4>{ translate( 'How did we do?' ) }</h4>
						<Gridicon icon="cross" size={ 24 } onClick={ dismissPrompt } />
					</div>
					<p>{ text() }</p>
					<Button
						href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
						target="_blank"
						onClick={ dismissPromptAsReviewed }
					>
						{ translate( 'Leave a review' ) }
						<Gridicon icon="external" />
					</Button>
				</Card>
			) }
		</>
	);
};

export default JetpackReviewPrompt;
