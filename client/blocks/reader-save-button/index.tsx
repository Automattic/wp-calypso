import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { keyForPost } from 'calypso/reader/post-key';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { useDispatch, useSelector } from 'calypso/state';
import { savePost, unsavePost } from 'calypso/state/reader/saved/actions';
import { isPostSaved } from 'calypso/state/reader/saved/selectors';
import type { TrackPostData } from 'calypso/state/reader/analytics/types';

import './style.scss';

interface ReaderSaveButtonProps {
	post: Record< string, unknown >;
	iconSize?: number;
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
	const postKey = keyForPost( post );
	const saved = useSelector( ( state ) => ( postKey ? isPostSaved( state, postKey ) : false ) );

	const handleClick = () => {
		if ( ! postKey ) {
			return;
		}

		if ( saved ) {
			dispatch( unsavePost( postKey ) );
			recordAction( 'unsaved_post' );
			recordGaEvent( 'Clicked Unsave Post' );
			recordTrackForPost( 'calypso_reader_article_unsaved', post as unknown as TrackPostData );
		} else {
			dispatch( savePost( postKey ) );
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
			data-tooltip={ tooltip }
		>
			<SaveIcon iconSize={ iconSize } saved={ saved } />
		</button>
	);
}
