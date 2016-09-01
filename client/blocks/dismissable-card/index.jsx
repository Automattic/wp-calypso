/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop, flow } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const PREFERENCE_PREFIX = 'dismissable-card-';

class DismissableCard extends Component {

	static propTypes = {
		className: PropTypes.string,
		dismissCard: PropTypes.func,
		isDismissed: PropTypes.bool,
		temporary: PropTypes.bool,
		onClick: PropTypes.func,
		preferenceName: PropTypes.string.isRequired
	};

	static defaultProps = {
		onClick: noop
	};

	render() {
		const { className, isDismissed, onClick, dismissCard } = this.props;

		if ( isDismissed ) {
			return null;
		}

		return (
			<Card className={ className }>
				<Gridicon
					icon="cross"
					className="dismissable-card__close-icon"
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
			isDismissed: getPreference( state, preference )
		};
	},
	( dispatch, ownProps ) => bindActionCreators( {
		dismissCard: () => {
			const preference = `${ PREFERENCE_PREFIX }${ ownProps.preferenceName }`;
			if ( ownProps.temporary ) {
				return setPreference( preference, true );
			}
			return savePreference( preference, true );
		}
	}, dispatch )
)( DismissableCard );

