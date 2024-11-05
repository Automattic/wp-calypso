import { Count } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';

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
	sites: Site[];
};

type State = {
	showAllSites: boolean;
};

const SITE_DISPLAY_LIMIT = 8;

export class ReaderSidebarRecent extends Component< Props, State > {
	state: State = {
		showAllSites: false,
	};

	toggleShowAllSites = () => {
		this.setState( ( prevState ) => ( { showAllSites: ! prevState.showAllSites } ) );
	};

	render() {
		const { translate, isOpen, onClick, className, sites } = this.props;
		const { showAllSites } = this.state;

		const sitesToShow = showAllSites ? sites : sites.slice( 0, SITE_DISPLAY_LIMIT );
		const totalUnseenCount = sites.reduce( ( total, site ) => total + site.unseen_count, 0 );

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
						{ translate( 'All' ) }{ ' ' }
						{ totalUnseenCount > 0 && <Count count={ totalUnseenCount } compact /> }
					</li>
					{ sitesToShow.map( ( site ) => (
						<li key={ site.ID }>
							{ site.name }{ ' ' }
							{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
						</li>
					) ) }
					{ sites.length > SITE_DISPLAY_LIMIT && (
						<li>
							<button onClick={ this.toggleShowAllSites }>
								{ showAllSites ? translate( 'View Less' ) : translate( 'View More' ) }
							</button>
						</li>
					) }
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default connect( ( state ) => {
	return {
		sites: getReaderFollowedSites( state ),
	};
} )( localize( ReaderSidebarRecent ) );
