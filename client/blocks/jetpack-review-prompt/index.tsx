import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect } from 'react';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { dismiss } from 'calypso/state/jetpack-review-prompt/actions';
import { getIsDismissed, getValidFromDate } from 'calypso/state/jetpack-review-prompt/selectors';
import { hasReceivedRemotePreferences as getHasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

interface Props {
	align: 'left' | 'center';
	type: 'scan' | 'restore';
}

const JetpackReviewPrompt: FunctionComponent< Props > = ( { align = 'center', type } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const site = useSelector( ( state ) => getSite( state, siteId ) ); // Replace `siteId` with the appropriate variable or prop
	const hasBackup = site?.options?.jetpack_connection_active_plugins?.includes( 'jetpack-backup' );

	// dismiss count is stored in a preference, make sure we have that before rendering
	const hasReceivedRemotePreferences = useSelector( getHasReceivedRemotePreferences );

	const isDismissed = useSelector( ( state ) => getIsDismissed( state, type ) );
	const validFrom = useSelector( ( state ) => getValidFromDate( state, type ) );

	const isValid = null !== validFrom && validFrom < Date.now();

	const dismissPrompt = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_review_prompt_dismiss', {
				reviewed: false,
				type,
				has_backup: hasBackup,
			} )
		);
		dispatch( dismiss( type, Date.now() ) );
	}, [ dispatch, hasBackup, type ] );

	const dismissPromptAsReviewed = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_review_prompt_dismiss', {
				reviewed: true,
				type,
				has_backup: hasBackup,
			} )
		);
		dispatch( dismiss( type, Date.now(), true ) );
	}, [ dispatch, hasBackup, type ] );

	const shouldRenderReviewPrompt = hasReceivedRemotePreferences && ! isDismissed && isValid;

	useEffect( () => {
		if ( shouldRenderReviewPrompt ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_review_prompt_view', {
					type,
					has_backup: hasBackup,
				} )
			);
		}
	}, [ dispatch, hasBackup, shouldRenderReviewPrompt, type ] );

	const body = () => {
		switch ( type ) {
			case 'restore':
				return (
					<p>
						{ translate(
							'Was it easy to restore your site? Leave us a review and help spread the word.'
						) }
					</p>
				);
			case 'scan':
			default:
				return (
					<p>
						{ translate(
							'Are you happy with Jetpack Scan? Leave us a review and help spread the word.'
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

	const reviewLink =
		hasBackup && type === 'restore'
			? 'https://wordpress.org/support/plugin/jetpack-backup/reviews/#new-post'
			: 'https://wordpress.org/support/plugin/jetpack/reviews/#new-post';

	return (
		<>
			<QueryPreferences />
			{ shouldRenderReviewPrompt && (
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
						href={ reviewLink }
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
