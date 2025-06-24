import { localize } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction as statRecordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

const SiteEmptyContent = ( { translate } ) => {
	const dispatch = useDispatch();

	const recordAction = () => {
		statRecordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_search_on_empty_site_stream_clicked' ) );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const action = (
		<a className="empty-content__action button" onClick={ recordAction } href="/reader/search">
			{ translate( 'Find sites to follow' ) }
		</a>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */

	return (
		<EmptyContent
			title={ translate( 'No posts' ) }
			line={ translate( 'This site has not posted anything yet. Try back later.' ) }
			action={ action }
		/>
	);
};

export default localize( SiteEmptyContent );
