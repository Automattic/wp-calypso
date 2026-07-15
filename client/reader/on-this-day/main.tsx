import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import NavigationHeader from 'calypso/components/navigation-header';
import ResurrectedWelcomeModalGate from 'calypso/components/resurrected-welcome-modal';
import ReaderOnboardingGate from 'calypso/reader/onboarding/gate';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream from 'calypso/reader/stream';
import { useDispatch, useSelector } from 'calypso/state';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { useFollowingView } from '../following/view-preference';
import ViewToggle from '../following/view-toggle';
import { WriteButton } from '../following/write-button';
import { getOnThisDayStreamKey } from './get-stream-key';
import { OnThisDay } from './index';
import '../following/style.scss';

const loadTrackResurrections = () =>
	import(
		/* webpackChunkName: "async-load-calypso-lib-analytics-track-resurrections" */ 'calypso/lib/analytics/track-resurrections'
	);

function OnThisDayStream() {
	const { currentView } = useFollowingView();
	const query = useSelector( getCurrentQueryArguments );
	const onThisDayStreamKey = useMemo( () => getOnThisDayStreamKey( query ), [ query ] );
	const dispatch = useDispatch();
	const [ isResurrectedModalVisible, setIsResurrectedModalVisible ] = useState( false );
	const [ shouldDelayReaderOnboarding, setShouldDelayReaderOnboarding ] = useState( false );
	const [ readerOnboardingShouldShow, setReaderOnboardingShouldShow ] = useState( false );

	const handleReaderOnboardingRender = useCallback(
		( willRender: boolean ) => {
			setReaderOnboardingShouldShow( willRender );
			if ( willRender && isResurrectedModalVisible ) {
				setShouldDelayReaderOnboarding( true );
			}
			if ( ! willRender ) {
				setShouldDelayReaderOnboarding( false );
			}
		},
		[ isResurrectedModalVisible ]
	);

	useEffect( () => {
		if ( shouldDelayReaderOnboarding && ! isResurrectedModalVisible ) {
			setShouldDelayReaderOnboarding( false );
		}
	}, [ shouldDelayReaderOnboarding, isResurrectedModalVisible ] );

	const suppressReaderOnboarding =
		readerOnboardingShouldShow && ( isResurrectedModalVisible || shouldDelayReaderOnboarding );

	useEffect( () => {
		dispatch( selectSidebarRecentSite( { feedId: null } ) );
	}, [ dispatch ] );

	return (
		<>
			{ currentView === 'recent' ? (
				<OnThisDay
					viewToggle={
						<>
							<ViewToggle />
							<WriteButton />
						</>
					}
					streamKey={ onThisDayStreamKey }
				/>
			) : (
				<ReaderStream streamKey={ onThisDayStreamKey } trackScrollPage className="following">
					<NavigationHeader
						title={ translate( 'On This Day' ) }
						subtitle={ translate( 'Posts from this day in previous years.' ) }
						className="following-stream-header"
					>
						<ViewToggle />
						<WriteButton />
					</NavigationHeader>
					<ReaderOnboardingGate
						onRender={ handleReaderOnboardingRender }
						isSuppressed={ suppressReaderOnboarding }
					/>
				</ReaderStream>
			) }
			<ResurrectedWelcomeModalGate onVisibilityChange={ setIsResurrectedModalVisible } />
			<AsyncLoad require={ loadTrackResurrections } placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( OnThisDayStream );
