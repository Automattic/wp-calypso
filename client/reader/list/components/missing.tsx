import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

export function ListMissing() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const trackAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_following_on_missing_list_clicked' ) );
	};

	return (
		<ReaderMain>
			<DocumentHead title={ translate( 'List not found' ) } />
			<EmptyContent
				title={ translate( 'List not found' ) }
				line={ translate( "Sorry, we couldn't find that list." ) }
				action={ translate( 'Back to Followed Sites' ) }
				actionURL="/reader"
				actionCallback={ trackAction }
			/>
		</ReaderMain>
	);
}

export default ListMissing;
