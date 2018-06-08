/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { fetchUserPurchases } from 'state/purchases/actions';

export class QueryUserPurchases extends PureComponent {
	static propTypes = {
		fetchUserPurchases: PropTypes.func.isRequired,
		userId: PropTypes.number.isRequired,
	};

	componentDidMount() {
		this.props.fetchUserPurchases( this.props.userId );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.userId !== this.props.userId ) {
			this.props.fetchUserPurchases( this.props.userId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchUserPurchases } )( QueryUserPurchases );
