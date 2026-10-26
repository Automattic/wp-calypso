import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useIsPostSaved, useSavePost } from 'calypso/reader/data/saved-posts';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type { Post } from 'calypso/reader/data/post';
import type { TrackPostData } from 'calypso/state/reader/analytics/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ReaderSaveButtonProps {
	post: Post;
	iconSize?: number;
}

// wpcom surfaces the WP REST error code on `.code` (proxy) or `.error` (xhr).
function getErrorCode( error: unknown ) {
	const { code, error: legacyCode } = ( error ?? {} ) as { code?: unknown; error?: unknown };
	return typeof code === 'string' ? code : legacyCode;
}

function SaveIcon( { iconSize = 24, saved }: { iconSize: number; saved: boolean } ) {
	return (
		<svg
			className="reader-save-button__icon"
			width={ iconSize }
			height={ iconSize }
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			{ saved ? (
				<path d="M6.5 4h11a1.5 1.5 0 011.5 1.5v14.25a.75.75 0 01-1.19.61L12 15.9l-5.81 4.46A.75.75 0 015 19.75V5.5A1.5 1.5 0 016.5 4z" />
			) : (
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M6.5 4h11a1.5 1.5 0 011.5 1.5v14.25a.75.75 0 01-1.19.61L12 15.9l-5.81 4.46A.75.75 0 015 19.75V5.5A1.5 1.5 0 016.5 4zm0 1.5v12.58l5.06-3.88a.75.75 0 01.88 0l5.06 3.88V5.5h-11z"
				/>
			) }
		</svg>
	);
}

export default function ReaderSaveButton( { post, iconSize = 24 }: ReaderSaveButtonProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const saved = useIsPostSaved( post );
	const { savePost, unsavePost, isPending } = useSavePost();
	// Until the saved keys load, a click can't tell a save from an unsave.
	const isDisabled = isPending || saved === undefined;
	const showError = ( message: TranslateResult ) =>
		dispatch( errorNotice( message, { duration: 5000 } ) );

	const handleClick = () => {
		if ( isDisabled ) {
			return;
		}

		if ( saved ) {
			unsavePost( post, {
				onError: () =>
					showError(
						translate(
							'Sorry, there was a problem removing that post from Saved. Please try again.'
						)
					),
			} );
			recordAction( 'unsaved_post' );
			recordGaEvent( 'Clicked Unsave Post' );
			recordTrackForPost( 'calypso_reader_article_unsaved', post as unknown as TrackPostData );
		} else {
			savePost( post, {
				onError: ( error ) =>
					showError(
						getErrorCode( error ) === 'saved_limit_reached'
							? translate( 'You’ve saved as many posts as you can. Remove some to save more.' )
							: translate( 'Sorry, there was a problem saving that post. Please try again.' )
					),
			} );
			recordAction( 'saved_post' );
			recordGaEvent( 'Clicked Save Post' );
			recordTrackForPost( 'calypso_reader_article_saved', post as unknown as TrackPostData );
		}
	};

	const tooltip = saved ? translate( 'Saved' ) : translate( 'Save to read later' );

	return (
		<button
			className={ clsx( 'reader-save-button', 'tooltip', { 'is-saved': saved } ) }
			onClick={ handleClick }
			aria-label={ tooltip }
			aria-disabled={ isDisabled }
			data-tooltip={ tooltip }
		>
			<SaveIcon iconSize={ iconSize } saved={ !! saved } />
		</button>
	);
}
