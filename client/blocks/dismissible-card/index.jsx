/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop, flow } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryPreferences from 'components/data/query-preferences';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const PREFERENCE_PREFIX = 'dismissible-card-';

class DismissibleCard extends Component {
	static propTypes = {
		className: PropTypes.string,
		dismissCard: PropTypes.func,
		isDismissed: PropTypes.bool,
		temporary: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
		onClick: PropTypes.func,
		preferenceName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		onClick: noop,
	};

	render() {
		const { className, isDismissed, onClick, dismissCard } = this.props;

		if ( isDismissed ) {
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
		const dismissedPreference = getPreference( state, preference );

		return {
			isDismissed:
				typeof ownProps.temporary === 'number' && dismissedPreference && dismissedPreference > 0
					? dismissedPreference + ownProps.temporary * 1000 > Date.now()
					: dismissedPreference,
		};
	},
	( dispatch, ownProps ) =>
		bindActionCreators(
			{
				dismissCard: () => {
					const preference = `${ PREFERENCE_PREFIX }${ ownProps.preferenceName }`;
					if ( typeof ownProps.temporary === 'boolean' ) {
						return setPreference( preference, true );
					}
					return savePreference(
						preference,
						typeof ownProps.temporary === 'number' ? Date.now() : true
					);
				},
			},
			dispatch
		)
)( DismissibleCard );
