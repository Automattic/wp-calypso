/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderSidebarOrganizationsListItem from './list-item';
import getOrganizationSites from 'calypso/state/reader/follows/selectors/get-reader-follows-organization';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import SidebarItem from 'calypso/layout/sidebar/item';
import Count from 'calypso/components/count';

/**
 * Styles
 */
import '../style.scss';
import SVGIcon from 'calypso/components/svg-icon';
import AutomatticLogo from 'calypso/assets/images/icons/a8c-logo.svg';
import P2Logo from 'calypso/assets/images/icons/p2-logo.svg';

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
			return <SVGIcon name="a8c-logo" icon={ AutomatticLogo } classes="sidebar__menu-icon" />;
		}
		return <SVGIcon name="p2-logo" icon={ P2Logo } classes="sidebar__menu-icon" />;
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
		const { organization } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}
		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOrganizationOpen }
				title={ organization.title }
				onClick={ this.handleClick }
				customIcon={ this.renderIcon() }
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
