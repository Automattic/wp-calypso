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

export class ReaderSidebarRecent extends Component< {
	isOpen: boolean;
	onClick: () => void;
	className: string;
	translate: ( key: string ) => string;
	sites: Site[];
} > {
	render() {
		const { translate, isOpen, onClick, className, sites } = this.props;
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
					{ sites.map( ( site ) => (
						<li key={ site.ID }>
							{ site.name }{ ' ' }
							{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
						</li>
					) ) }
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
