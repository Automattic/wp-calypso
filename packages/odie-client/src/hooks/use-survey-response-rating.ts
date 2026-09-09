import { getSurveyResponseRatingMetadataKey } from '@automattic/zendesk-client';
import { useCallback, useEffect, useState } from 'react';
import Smooch from 'smooch';

/**
 * Persists a CSAT Survey Response's rating (and whether the responder has finished submitting)
 * on the Zendesk conversation's own metadata, keyed by survey_response_id. This is the source
 * of truth -- local component state alone doesn't survive the message list re-rendering/
 * remounting the message this lives in, which happens independently of anything the user does.
 *
 * `recoveredRating` is intentionally separate from `rating`: it's set only by the mount-time
 * fetch from Smooch, never by `persistRating()`. Callers should use it (not `rating`) to key/
 * initialize a component that needs to survive a remount -- using `rating` there would force an
 * immediate remount the instant the responder clicks, before their request even starts,
 * discarding any in-progress loading state.
 */
export const useSurveyResponseRating = (
	surveyResponseId: string,
	conversationId: string | null
) => {
	const [ rating, setRating ] = useState< 'good' | 'bad' | undefined >( undefined );
	const [ recoveredRating, setRecoveredRating ] = useState< 'good' | 'bad' | undefined >(
		undefined
	);
	const [ isDismissed, setIsDismissed ] = useState( false );
	const ratingKey = getSurveyResponseRatingMetadataKey( surveyResponseId );
	const dismissedKey = `zd_survey_dismissed_${ surveyResponseId }`;

	useEffect( () => {
		if ( ! conversationId ) {
			return;
		}

		let isCancelled = false;

		Smooch.getConversationById( conversationId ).then( ( conversation ) => {
			if ( isCancelled ) {
				return;
			}

			const storedRating = conversation?.metadata?.[ ratingKey ];

			if ( storedRating === 'good' || storedRating === 'bad' ) {
				setRating( storedRating );
				setRecoveredRating( storedRating );
			}

			if ( conversation?.metadata?.[ dismissedKey ] ) {
				setIsDismissed( true );
			}
		} );

		return () => {
			isCancelled = true;
		};
	}, [ conversationId, ratingKey, dismissedKey ] );

	const persistRating = useCallback(
		async ( score: 'good' | 'bad' ) => {
			setRating( score );

			if ( ! conversationId ) {
				return;
			}

			const conversation = await Smooch.getConversationById( conversationId );

			await Smooch.updateConversation( conversationId, {
				metadata: {
					...conversation?.metadata,
					[ ratingKey ]: score,
				},
			} );
		},
		[ conversationId, ratingKey ]
	);

	const persistDismissed = useCallback( async () => {
		setIsDismissed( true );

		if ( ! conversationId ) {
			return;
		}

		const conversation = await Smooch.getConversationById( conversationId );

		await Smooch.updateConversation( conversationId, {
			metadata: {
				...conversation?.metadata,
				[ dismissedKey ]: true,
			},
		} );
	}, [ conversationId, dismissedKey ] );

	return { rating, recoveredRating, isDismissed, persistRating, persistDismissed };
};
