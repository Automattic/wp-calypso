import page from '@automattic/calypso-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useOrganizationSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import ReaderSidebarOrganizationsListItem from './list-item';
export class ReaderSidebarOrganizationsList extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		organization: PropTypes.object,
		sites: PropTypes.array,
		teams: PropTypes.array,
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

	render() {
		const { organization, path, sites } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}

		const isChildSelected = sites.some( ( site ) => path === `/reader/feeds/${ site.feed_ID }` );
		const unseenCount = sites.reduce( ( acc, item ) => acc + ( item.unseen_count ?? 0 ), 0 );

		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOrganizationOpen }
				title={ organization.title }
				count={ unseenCount > 0 ? unseenCount : undefined }
				onClick={ this.selectMenu }
				expandableIconClick={ this.toggleMenu }
				disableFlyout
				className={ clsx( 'has-counts', {
					'sidebar__menu--selected':
						'/reader/' + organization.slug === path ||
						( ! this.props.isOrganizationOpen && isChildSelected ),
				} ) }
			>
				{ this.renderSites() }
			</ExpandableSidebarMenu>
		);
	}
}

function OrganizationsListWithFollows( props ) {
	const sites = useOrganizationSiteSubscriptions( props.organization.id );
	return <ReaderSidebarOrganizationsList { ...props } sites={ sites } />;
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
