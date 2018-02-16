/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ListEnd from 'components/list-end';
import { bumpStat } from 'state/analytics/actions';

/**
 * Constants
 */
const MAX_INVITES_DISPLAYED = 100;

class InvitesListEnd extends React.PureComponent {
	static propTypes = {
		found: PropTypes.number,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.found !== this.props.found && nextProps.found > MAX_INVITES_DISPLAYED ) {
			this.props.bumpStat( 'calypso_people_invite_list', 'displayed_max' );
		}
	}

	render() {
		return <ListEnd />;
	}
}

export default connect( null, { bumpStat } )( InvitesListEnd );
