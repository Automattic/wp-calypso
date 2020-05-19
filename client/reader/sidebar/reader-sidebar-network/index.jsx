/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarNetworkList from './list';
import getSitesWPForTeams from 'state/selectors/get-sites-wpforteams';

export class ReaderSidebarNetwork extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		unseen: PropTypes.object,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	render() {
		const { isOpen, translate, onClick, unseen } = this.props;
		return (
			<ul className={ unseen && unseen.status ? 'has-unseen' : '' }>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				{ unseen && unseen.status && <span className="sidebar__bubble" /> }
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'P2 Network' ) }
					onClick={ onClick }
					icon="globe"
				>
					<ReaderSidebarNetworkList { ...this.props } />
				</ExpandableSidebarMenu>
			</ul>
		);
	}
}

export default connect( ( state ) => ( {
	blogs: getSitesWPForTeams( state ),
} ) )( localize( ReaderSidebarNetwork ) );
