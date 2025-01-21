import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

export default function ListEmptyContent(): JSX.Element {
	const dispatch = useDispatch();
	const translate = useTranslate();

	function onClickActionBtn(): void {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_following_on_empty_list_stream_clicked' ) );
	}

	const action = (
		<a
			className="empty-content__action button is-primary"
			onClick={ onClickActionBtn }
			href="/read"
		>
			{ translate( 'Back to Following' ) }
		</a>
	);

	return (
		<EmptyContent
			title={ translate( 'No recent posts' ) }
			line={ translate( 'The sites in this list have not posted anything recently.' ) }
			action={ action }
			illustration="/calypso/images/illustrations/illustration-empty-results.svg"
			illustrationWidth={ 400 }
		/>
	);
}
