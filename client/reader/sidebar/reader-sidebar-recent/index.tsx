import { Count } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';

// TODO: Find the right home for this, or the existing definition
type Site = {
	ID: number;
	URL: string;
	feed_URL: string;
	feed_ID: number;
	date_subscribed: number;
	last_updated: number;
	delivery_methods: {
		notification: {
			send_posts: boolean;
		};
	};
	is_owner: boolean;
	organization_id: number;
	name: string;
	unseen_count: number;
	site_icon: string | null;
	is_following: boolean;
};

type Props = {
	isOpen: boolean;
	onClick: () => void;
	className: string;
	translate: ( key: string ) => string;
};

const SITE_DISPLAY_CUTOFF = 8;

const ReaderSidebarRecent = ( {
	translate,
	isOpen,
	onClick,
	className,
}: Props ): React.JSX.Element => {
	const [ showAllSites, setShowAllSites ] = useState( false );
	const sites = useSelector< Site, Site[] >( getReaderFollowedSites );

	const sitesToShow = showAllSites ? sites : sites.slice( 0, SITE_DISPLAY_CUTOFF );
	const totalUnseenCount = sites.reduce( ( total, site ) => total + site.unseen_count, 0 );

	const toggleShowAllSites = () => {
		setShowAllSites( ! showAllSites );
	};

	const dispatch = useDispatch();
	const selectSite = ( feedId: number | null ) => {
		dispatch( selectSidebarRecentSite( { feedId } ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Recent' ) }
				onClick={ onClick }
				customIcon={ <ReaderFollowingIcon /> }
				disableFlyout
				className={ className }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				<li>
					<button onClick={ () => selectSite( null ) }>
						{ translate( 'All' ) }{ ' ' }
						{ totalUnseenCount > 0 && <Count count={ totalUnseenCount } compact /> }
					</button>
				</li>
				{ sitesToShow.map( ( site ) => (
					<li key={ site.ID }>
						<button onClick={ () => selectSite( site.feed_ID ) }>
							{ site.name }{ ' ' }
							{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
						</button>
					</li>
				) ) }
				{ sites.length > SITE_DISPLAY_CUTOFF && (
					<li>
						<button onClick={ toggleShowAllSites }>
							{ showAllSites ? translate( 'View Less' ) : translate( 'View More' ) }
						</button>
					</li>
				) }
			</ExpandableSidebarMenu>
		</li>
	);
};

export default localize( ReaderSidebarRecent );
