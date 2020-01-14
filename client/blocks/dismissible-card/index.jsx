/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop, flow } from 'lodash';
import { Gridicon, Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'state/preferences/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const PREFERENCE_PREFIX = 'dismissible-card-';

class DismissibleCard extends Component {
	static propTypes = {
		className: PropTypes.string,
		dismissCard: PropTypes.func,
		isDismissed: PropTypes.bool,
		temporary: PropTypes.bool,
		onClick: PropTypes.func,
		preferenceName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		onClick: noop,
	};

	render() {
		const { className, isDismissed, onClick, dismissCard, hasReceivedPreferences } = this.props;

		if ( isDismissed || ! hasReceivedPreferences ) {
			return null;
		}

		return (
			<Card className={ className }>
				<QueryPreferences />
				<Gridicon
					icon="cross"
					className="dismissible-card__close-icon"
					onClick={ flow( onClick, dismissCard ) }
				/>
				{ this.props.children }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const preference = `${ PREFERENCE_PREFIX }${ ownProps.preferenceName }`;

		return {
			isDismissed: getPreference( state, preference ),
			hasReceivedPreferences: hasReceivedRemotePreferences( state ),
		};
	},
	( dispatch, ownProps ) =>
		bindActionCreators(
			{
				dismissCard: () => {
					const preference = `${ PREFERENCE_PREFIX }${ ownProps.preferenceName }`;
					if ( ownProps.temporary ) {
						return setPreference( preference, true );
					}
					return savePreference( preference, true );
				},
			},
			dispatch
		)
)( DismissibleCard );
