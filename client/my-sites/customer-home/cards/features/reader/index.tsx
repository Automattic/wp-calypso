import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import iconReaderLightbulb from 'calypso/assets/images/customer-home/reader-lightbulb.svg';
import withDimensions from 'calypso/lib/with-dimensions';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import DiscoverNavigation from 'calypso/reader/discover/components/navigation';
import { DEFAULT_TAB, buildDiscoverStreamKey } from 'calypso/reader/discover/helper';
import Stream from 'calypso/reader/stream';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

import './style.scss';

const ReaderCard = () => {
	const translate = useTranslate();

	const queryParams = new URLSearchParams( window.location.search );
	const selectedTab = queryParams.get( 'selectedTab' ) || DEFAULT_TAB;

	const streamKey = buildDiscoverStreamKey( selectedTab, [ 'dailyprompt' ] );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_discover_viewed' ) );
	}, [ dispatch ] );

	return (
		<>
			<div className="reader-card customer-home__card">
				<div className="reader-card__header">
					<h2 className="reader-card__title">
						<div className="reader-card__title-icon">
							<img src={ iconReaderLightbulb } alt="" />
						</div>
						<span>{ translate( 'Increase views by engaging with others' ) }</span>
					</h2>
					<span className="reader-card__subtitle">
						{ translate(
							'Thoughtfully commenting on other sites is a great way to grow your audience.'
						) }
					</span>
				</div>
				<DiscoverNavigation selectedTab={ selectedTab } />
				<Stream
					streamKey={ streamKey }
					trackScrollPage={ trackScrollPage.bind( null ) }
					useCompactCards
					isDiscoverStream
					suppressSiteNameLink
				/>
			</div>
		</>
	);
};

export default withDimensions( ReaderCard );
