/** @format */

/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { clearUsernameValidation, validateUsername } from 'state/username/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:query-username-validation' );

class QueryUsernameValidation extends Component {
	static propTypes = {
		username: PropTypes.string,
	};

	componentDidMount() {
		this.props.clearUsernameValidation();
		this.debouncedValidateUsername();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.username !== prevProps.username ) {
			this.debouncedValidateUsername();
		}
	}

	componentWillUnmount() {
		this.props.clearUsernameValidation();
	}

	debouncedValidateUsername = debounce( this.requestForValidation, 600 );

	requestForValidation() {
		const { username } = this.props;
		log( `Validating username ${ username }` );
		this.props.validateUsername( username );
	}

	render() {
		return null;
	}
}

export default connect( null, dispatch =>
	bindActionCreators(
		{
			clearUsernameValidation,
			validateUsername,
		},
		dispatch
	)
)( QueryUsernameValidation );
