import { Card, CardBody } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import NavigationHeader from 'calypso/components/navigation-header';
import ResurrectedWelcomeModalGate from 'calypso/components/resurrected-welcome-modal';
import { QuickPostSkeleton } from 'calypso/reader/components/quick-post/skeleton';
import ReaderOnboardingGate from 'calypso/reader/onboarding/gate';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream from 'calypso/reader/stream';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { useFollowingView } from '../following/view-preference';
import ViewToggle from '../following/view-toggle';
import { getOnThisDayStreamKey } from './get-stream-key';
import { OnThisDay } from './index';
import '../following/style.scss';

function OnThisDayStream() {
	const { currentView } = useFollowingView();
	const query = useSelector( getCurrentQueryArguments );
	const onThisDayStreamKey = useMemo( () => getOnThisDayStreamKey( query ), [ query ] );
	const dispatch = useDispatch();
	const [ isResurrectedModalVisible, setIsResurrectedModalVisible ] = useState( false );
	const [ shouldDelayReaderOnboarding, setShouldDelayReaderOnboarding ] = useState( false );
	const [ readerOnboardingShouldShow, setReaderOnboardingShouldShow ] = useState( false );
	const currentUser = useSelector( getCurrentUser );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;

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
				<OnThisDay viewToggle={ <ViewToggle /> } streamKey={ onThisDayStreamKey } />
			) : (
				<ReaderStream streamKey={ onThisDayStreamKey } trackScrollPage className="following">
					<NavigationHeader
						title={ translate( 'On This Day' ) }
						subtitle={ translate( 'Posts from this day in previous years.' ) }
						className="following-stream-header"
					>
						<ViewToggle />
					</NavigationHeader>
					{ hasSites && (
						<Card className="following-stream__quick-post-card">
							<CardBody>
								<AsyncLoad
									require={ () =>
										import(
											/* webpackChunkName: "async-load-calypso-reader-components-quick-post" */ 'calypso/reader/components/quick-post'
										)
									}
									placeholder={ <QuickPostSkeleton /> }
								/>
							</CardBody>
						</Card>
					) }
					<ReaderOnboardingGate
						onRender={ handleReaderOnboardingRender }
						isSuppressed={ suppressReaderOnboarding }
					/>
				</ReaderStream>
			) }
			<ResurrectedWelcomeModalGate onVisibilityChange={ setIsResurrectedModalVisible } />
			<AsyncLoad
				require={ () =>
					import(
						/* webpackChunkName: "async-load-calypso-lib-analytics-track-resurrections" */ 'calypso/lib/analytics/track-resurrections'
					)
				}
				placeholder={ null }
			/>
		</>
	);
}

export default SuggestionProvider( OnThisDayStream );
