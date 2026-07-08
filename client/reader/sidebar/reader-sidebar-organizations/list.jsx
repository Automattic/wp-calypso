import page from '@automattic/calypso-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import {
	useOrganizationFeedsInfo,
	useOrganizationSiteSubscriptions,
} from 'calypso/reader/data/site-subscriptions';
import { AUTOMATTIC_ORG_ID, P2_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { MoreMenuActions } from '../more-menu-actions';
import ReaderSidebarOrganizationsListItem from './list-item';

export class ReaderSidebarOrganizationsList extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		organization: PropTypes.object,
		sites: PropTypes.array,
		teams: PropTypes.array,
		feedsInfo: PropTypes.shape( {
			unseenCount: PropTypes.number,
			feedIds: PropTypes.array,
			feedUrls: PropTypes.array,
		} ),
	};

	toggleMenu = () => {
		this.props.toggleReaderSidebarOrganization( { organizationId: this.props.organization.id } );
	};

	selectMenu = () => {
		const { organization, path } = this.props;
		const defaultSelection = organization.slug && `/reader/${ organization.slug }`;
		if ( defaultSelection && path !== defaultSelection ) {
			page( defaultSelection );
		}
	};

	renderSites() {
		const { sites, path } = this.props;
		return sites.map(
			( site ) =>
				site && <ReaderSidebarOrganizationsListItem key={ site.ID } path={ path } site={ site } />
		);
	}

	identifierForOrganizationId( organizationId ) {
		if ( organizationId === AUTOMATTIC_ORG_ID ) {
			return 'a8c';
		}

		if ( organizationId === P2_ORG_ID ) {
			return 'p2';
		}

		return `organization-${ organizationId }`;
	}

	render() {
		const { organization, path, sites, feedsInfo } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}

		const isChildSelected = sites.some( ( site ) => path === `/reader/feeds/${ site.feed_ID }` );

		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOrganizationOpen }
				title={ organization.title }
				count={ feedsInfo.unseenCount }
				onClick={ this.selectMenu }
				expandableIconClick={ this.toggleMenu }
				disableFlyout
				className={ clsx( 'has-counts', {
					'sidebar__menu--selected':
						'/reader/' + organization.slug === path ||
						( ! this.props.isOrganizationOpen && isChildSelected ),
				} ) }
				moreMenuActions={
					<MoreMenuActions
						identifier={ this.identifierForOrganizationId( organization.id ) }
						feedIds={ feedsInfo.feedIds }
						feedUrls={ feedsInfo.feedUrls }
						unseenCount={ feedsInfo.unseenCount }
					/>
				}
			>
				{ this.renderSites() }
			</ExpandableSidebarMenu>
		);
	}
}

function OrganizationsListWithFollows( props ) {
	const sites = useOrganizationSiteSubscriptions( props.organization.id );
	const feedsInfo = useOrganizationFeedsInfo( props.organization.id );

	return <ReaderSidebarOrganizationsList { ...props } sites={ sites } feedsInfo={ feedsInfo } />;
}

export default connect(
	( state, ownProps ) => {
		return {
			isOrganizationOpen: isOrganizationOpen( state, ownProps.organization.id ),
		};
	},
	{
		toggleReaderSidebarOrganization,
	}
)( OrganizationsListWithFollows );
