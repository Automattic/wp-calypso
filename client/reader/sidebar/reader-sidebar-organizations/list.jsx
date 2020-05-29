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
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarOrganizationsListItem from './list-item';
import Gridicon from 'components/gridicon';
import getOrganizationSites from 'state/reader/follows/selectors/get-reader-follows-organization';
import { toggleReaderSidebarOrganization } from 'state/ui/reader/sidebar/actions';
import { isOrganizationOpen } from 'state/ui/reader/sidebar/selectors';
import { AUTOMATTIC_ORG_ID } from 'state/reader/organizations/constants';
import ReaderSidebarHelper from 'reader/sidebar/helper';
import SidebarItem from 'layout/sidebar/item';
import Count from 'components/count';

/**
 * Styles
 */
import '../style.scss';

export const renderA8CLogo = () => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<svg
			className="sidebar__menu-icon"
			width="24"
			height="24"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
		>
			<path
				d="M12 21.5c-6.1 0-10-4.4-10-9V12c0-4.6 4-9 10-9 6.1 0 10.1 4.3 10.1 9v.6c0 4.5-3.9 8.9-10.1
				8.9zm6.9-9.5c0-3.3-2.4-6.3-6.8-6.3s-6.8 3-6.8 6.3v.4c0 3.3 2.4 6.4 6.8 6.4s6.8-3 6.8-6.4V12z"
			/>
			<path d="M14.1 8.5c.6.4.7 1.2.4 1.7l-2.9 4.6c-.4.6-1.2.8-1.7.4-.7-.4-.9-1.2-.5-1.8l2.9-4.6c.4-.5 1.2-.7 1.8-.3z" />
		</svg>
	);
	/* eslint-disable wpcalypso/jsx-classname-namespace */
};

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
			return renderA8CLogo();
		}
		return <Gridicon icon="institution" className="sidebar__menu-icon" />;
	}

	renderAll() {
		const { translate, organization, path, sites } = this.props;
		if ( organization.id === AUTOMATTIC_ORG_ID ) {
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
						count={ sum }
					>
						{ sum > 0 && <Count count={ sum } compact /> }
					</SidebarItem>
				</>
			);
		}
		return null;
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
