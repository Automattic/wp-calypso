import page from '@automattic/calypso-router';
import { Count } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { useOrganizationSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { AllIcon } from '../icons/all';
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
		const { organization, isOrganizationOpen: isOpen, path } = this.props;
		if ( ! isOpen ) {
			this.toggleMenu();
		}
		const defaultSelection = organization.slug && `/reader/${ organization.slug }`;
		if ( defaultSelection && path !== defaultSelection ) {
			page( defaultSelection );
		}
	};

	renderAll() {
		const { translate, organization, path, sites } = this.props;
		// have a selector
		const sum = sites.reduce( ( acc, item ) => {
			acc = acc + item.unseen_count;
			return acc;
		}, 0 );
		return (
			<>
				<SidebarItem
					link={ '/reader/' + organization.slug }
					key={ translate( 'All' ) }
					label={ translate( 'All' ) }
					className={ ReaderSidebarHelper.itemLinkClass( '/reader/' + organization.slug, path, {
						'sidebar-streams__all': true,
					} ) }
					icon={ <AllIcon /> }
				>
					{ sum > 0 && <Count count={ sum } compact /> }
				</SidebarItem>
			</>
		);
	}

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

		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOrganizationOpen }
				title={ organization.title }
				onClick={ this.selectMenu }
				expandableIconClick={ this.toggleMenu }
				disableFlyout
				className={ clsx( 'has-counts', {
					'sidebar__menu--selected':
						'/reader/' + organization.slug === path ||
						( ! this.props.isOrganizationOpen && isChildSelected ),
				} ) }
			>
				{ this.renderAll() }
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
)( localize( OrganizationsListWithFollows ) );
