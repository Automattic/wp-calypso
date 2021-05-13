/**
 * External dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { dismiss } from 'calypso/state/jetpack-review-prompt/actions';
import { getIsDismissed, getValidFromDate } from 'calypso/state/jetpack-review-prompt/selectors';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { preventWidows } from 'calypso/lib/formatting';
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
	const moment = useLocalizedMoment();

	// dismiss count is stored in a preference, make sure we have that before rendering
	const hasReceivedRemotePreferences = useSelector( ( state ) =>
		getHasReceivedRemotePreferences( state )
	);

	const isDismissed = useSelector( ( state ) => getIsDismissed( state, type ) );
	const validFrom = useSelector( ( state ) => getValidFromDate( state, type ) );

	const isValid = null !== validFrom && validFrom < Date.now();

	const dismissPrompt = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_review_prompt_dismiss', {
				reviewed: false,
				type,
			} )
		);
		dispatch( dismiss( type, Date.now() ) );
	}, [ dispatch, type ] );

	const dismissPromptAsReviewed = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_review_prompt_dismiss', {
				reviewed: true,
				type,
			} )
		);
		dispatch( dismiss( type, Date.now(), true ) );
	}, [ dispatch, type ] );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_review_prompt_view', {
				type,
			} )
		);
	}, [ dispatch, type ] );

	const body = () => {
		switch ( type ) {
			case 'restore':
				return (
					<p>
						{ preventWidows(
							translate(
								'Was it easy to restore your site? Leave us a review and help spread the word.'
							)
						) }
					</p>
				);
			case 'scan':
			default:
				return (
					<p>
						{ translate( 'Scan fixed all threats {{strong}}%s{{/strong}}. Your site looks great!', {
							args: [ moment.utc( validFrom ).fromNow() ],
							components: {
								strong: <strong />,
							},
						} ) }

						<br />

						{ preventWidows(
							translate(
								'Are you happy with Jetpack Scan? Leave us a review and help spread the word.'
							)
						) }
					</p>
				);
		}
	};

	const topClass = () => {
		switch ( align ) {
			case 'left':
				return 'jetpack-review-prompt__left';
			default:
			case 'center':
				return 'jetpack-review-prompt__center';
		}
	};

	return (
		<>
			<QueryPreferences />
			{ hasReceivedRemotePreferences && ! isDismissed && isValid && (
				<Card className={ topClass() }>
					<Gridicon
						className="jetpack-review-prompt__close-icon"
						icon="cross"
						onClick={ dismissPrompt }
					/>
					<div className="jetpack-review-prompt__header">
						<Gridicon icon="status" size={ 48 } />
						<h3 className="jetpack-review-prompt__title">{ translate( 'How did we do?' ) }</h3>
					</div>
					{ body() }
					<Button
						borderless
						className="jetpack-review-prompt__review-link"
						href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
						onClick={ dismissPromptAsReviewed }
						target="_blank"
					>
						<span>{ translate( 'Leave a review' ) }</span>
						<Gridicon icon="external" />
					</Button>
				</Card>
			) }
		</>
	);
};

export default JetpackReviewPrompt;
