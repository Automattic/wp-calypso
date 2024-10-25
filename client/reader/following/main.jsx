import config from '@automattic/calypso-config';
import { DataViews } from '@wordpress/dataviews';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';

import './style.scss';

function FollowingStream( { ...props } ) {
<<<<<<< HEAD
=======
	const [ readerOnboardingIsRendered, setReaderOnboardingIsRendered ] = useState( false );

	const [ view, setView ] = useState( {
		type: 'list',
		fields: [ 'title', 'blog' ],
	} );
	const fields = [
		{
			id: 'title',
			label: translate( 'Title' ),
			enableHiding: false,
		},
		{
			id: 'blog',
			label: translate( 'Blog' ),
			enableHiding: false,
		},
	];
	const data = [
		{
			id: 1,
			title: 'Title',
			blog: 'Blog',
		},
	];
	/* eslint-disable wpcalypso/jsx-classname-namespace */
>>>>>>> 3eb6d0536b (Add DataViews to Reader.)
	return (
		<>
			{ config.isEnabled( 'reader/recent-feed-overhaul' ) ? (
				<DataViews
					getItemId={ ( item ) => item.id.toString() }
					data={ data }
					view={ view }
					fields={ fields }
					onChangeView={ setView }
				/>
<<<<<<< HEAD

				<ReaderOnboarding />
			</Stream>
=======
			) : (
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
			) }
>>>>>>> 3eb6d0536b (Add DataViews to Reader.)
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
