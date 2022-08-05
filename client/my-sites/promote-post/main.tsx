import './style.scss';

import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import PromotedPostFilter from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import PromotedPostList from 'calypso/my-sites/promote-post/components/promoted-post-list';
import { fetchCampaigns } from 'calypso/state/promote-post/actions';
import { getCampaigns, getIsFetching } from 'calypso/state/promote-post/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function PromotedPosts() {
	// -1 means not selected at all
	const [ selectedStatus, setSelectedStatus ] = useState( -1 );

	const selectedSiteId = useSelector( getSelectedSiteId );
	const campaigns = useSelector( ( state ) => {
		if ( ! selectedSiteId ) {
			return [];
		}
		return getCampaigns( state, selectedSiteId );
	} );
	const isFetching = useSelector( ( state ) => {
		if ( ! selectedSiteId ) {
			return false;
		}
		return getIsFetching( state, selectedSiteId );
	} );

	const dispatch = useDispatch();
	useEffect( () => {
		if ( selectedSiteId ) {
			dispatch( fetchCampaigns( selectedSiteId ) );
		}
	}, [ dispatch, selectedSiteId ] );

	const filteredCampaigns = useMemo( () => {
		return campaigns.filter( ( campaign ) => {
			return selectedStatus < 0 || campaign.status_smart === selectedStatus;
		} );
	}, [ campaigns, selectedStatus ] );

	const statuses = useMemo( () => {
		const statusToNumberMap = {} as { [ status: number ]: number };
		campaigns.forEach( ( campaign ) => {
			if ( statusToNumberMap.hasOwnProperty( campaign.status_smart ) ) {
				statusToNumberMap[ campaign.status_smart ]++;
			} else {
				statusToNumberMap[ campaign.status_smart ] = 1;
			}
		} );
		return Object.keys( statusToNumberMap ).map( ( status ) => ( {
			status: parseInt( status, 10 ),
			count: statusToNumberMap[ parseInt( status ) ],
		} ) );
	}, [ campaigns ] );

	return (
		<Main wideLayout className="promote-post">
			{ /* todo do we need those? */ }
			{ /*<ScreenOptionsTab wpAdminPath="edit.php?post_type=page" />*/ }
			{ /*<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />*/ }
			<DocumentHead title={ translate( 'Promoted Posts' ) } />
			<SitePreview />
			<FormattedHeader
				brandFont
				className="promote-post__heading"
				headerText={ translate( 'Promoted posts' ) }
				subHeaderText={ translate( 'Create, edit, and manage your promoted posts.' ) }
				align="left"
				// hasScreenOptions
			/>

			{ isFetching && <LoadingEllipsis /> }
			{ ! isFetching && (
				<>
					<PromotedPostFilter
						statuses={ statuses }
						selectedStatus={ selectedStatus }
						selectStatus={ ( status ) => setSelectedStatus( status ) }
					/>
					<PromotedPostList campaigns={ filteredCampaigns } />
				</>
			) }
		</Main>
	);
}
