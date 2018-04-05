/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import compareProps from 'lib/compare-props';
import { getRequest } from 'state/selectors';

class Query extends PureComponent {
	static propTypes = {
		compareOptions: PropTypes.object,
		requestAction: PropTypes.func.isRequired,
		requesting: PropTypes.bool.isRequired,
	};

	componentWillMount() {
		this.comparator = compareProps( {
			ignore: [ 'compareOptions', 'requestAction', 'requesting' ],
			...this.props.compareOptions,
		} );
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.comparator( this.props, nextProps ) ) {
			this.request( nextProps );
		}
	}

	// eslint-disable-next-line no-unused-vars
	request( { compareOptions, requestAction, requesting, ...props } ) {
		if ( requesting ) {
			return;
		}

		requestAction( ...values( props ) );
	}

	render() {
		return null;
	}
}

export default connect(
	// eslint-disable-next-line no-unused-vars
	( state, { compareOptions, requestAction, ...props } ) => ( {
		requesting: !! getRequest( state, requestAction( ...values( props ) ) ).isLoading,
	} ),
	( dispatch, { requestAction } ) => bindActionCreators( { requestAction }, dispatch )
)( Query );
