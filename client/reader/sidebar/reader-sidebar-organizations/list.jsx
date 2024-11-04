import { Count } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import ReaderA8cIcon from 'calypso/reader/components/icons/a8c-icon';
import ReaderP2Icon from 'calypso/reader/components/icons/p2-icon';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import getOrganizationSites from 'calypso/state/reader/follows/selectors/get-reader-follows-organization';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import ReaderSidebarOrganizationsListItem from './list-item';
import '../style.scss';

export class ReaderSidebarOrganizationsList extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		organization: PropTypes.object,
		sites: PropTypes.array,
		teams: PropTypes.array,
	};

	handleClick = () => {
		this.props.toggleReaderSidebarOrganization( { organizationId: this.props.organization.id } );
	};

	renderIcon() {
		const { organization } = this.props;
		if ( organization.id === AUTOMATTIC_ORG_ID ) {
			return <ReaderA8cIcon size={ 24 } viewBox="-5 0 24 24" />;
		}
		return <ReaderP2Icon viewBox="-3 0 24 24" />;
	}

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
					link={ '/read/' + organization.slug }
					key={ translate( 'All' ) }
					label={ translate( 'All' ) }
					className={ ReaderSidebarHelper.itemLinkClass( '/read/' + organization.slug, path, {
						'sidebar-streams__all': true,
					} ) }
				>
					{ sum > 0 && <Count count={ sum } compact /> }
				</SidebarItem>
			</>
		);
	}

	renderSites() {
		const { sites, path } = this.props;
		return map(
			sites,
			( site ) =>
				site && <ReaderSidebarOrganizationsListItem key={ site.ID } path={ path } site={ site } />
		);
	}

	render() {
		const { organization, path, sites } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}
		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOrganizationOpen }
				title={ organization.title }
				onClick={ this.handleClick }
				customIcon={ this.renderIcon() }
				disableFlyout
				className={
					( '/read/' + organization.slug === path ||
						sites.some( ( site ) => `/read/feeds/${ site.feed_ID }` === path ) ) &&
					'sidebar__menu--selected'
				}
			>
				{ this.renderAll() }
				{ this.renderSites() }
			</ExpandableSidebarMenu>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isOrganizationOpen: isOrganizationOpen( state, ownProps.organization.id ),
			sites: getOrganizationSites( state, ownProps.organization.id ), // get p2 network organizations
		};
	},
	{
		toggleReaderSidebarOrganization,
	}
)( localize( ReaderSidebarOrganizationsList ) );
