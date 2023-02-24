import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AutomatticLogo from 'calypso/assets/images/icons/a8c-logo.svg';
import P2Logo from 'calypso/assets/images/icons/p2-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import getOrganizationSites from 'calypso/state/reader/follows/selectors/get-reader-follows-organization';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import { isOrganizationOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import ReaderListOrganizationsListItem from './list-item';
import '../style.scss';

export class ReaderListOrganizationsList extends Component {
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

	renderSites() {
		const { sites, path } = this.props;
		return map(
			sites,
			( site ) =>
				site && <ReaderListOrganizationsListItem key={ site.ID } path={ path } site={ site } />
		);
	}

	render() {
		const { organization } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}
		return <ul>{ this.renderSites() }</ul>;
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
)( localize( ReaderListOrganizationsList ) );
