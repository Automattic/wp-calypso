import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	const [ readerOnboardingIsRendered, setReaderOnboardingIsRendered ] = useState( false );

	return (
		<>
			<Stream
				{ ...props }
				className="following"
				streamSidebar={ () => <ReaderListFollowedSites path={ window.location.pathname } /> }
			>
				<BloganuaryHeader />
				<NavigationHeader
					title={ translate( 'Recent' ) }
					subtitle={ translate( "Stay current with the blogs you've subscribed to." ) }
					className={ clsx( 'following-stream-header', {
						'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
					} ) }
				/>

				<ReaderOnboarding onRender={ setReaderOnboardingIsRendered } />
				{ ! readerOnboardingIsRendered && <FollowingIntro /> }
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
