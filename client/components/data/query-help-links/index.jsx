/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestHelpLinks } from 'calypso/state/help/actions';

class QueryHelpLinks extends Component {
	componentDidMount() {
		this.requestHelpLinks();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.query === this.props.query ) {
			return;
		}

		this.requestHelpLinks();
	}

	requestHelpLinks() {
		if ( this.props.query.length ) {
			this.props.requestHelpLinks( this.props.query );
		}
	}

	render() {
		return null;
	}
}

QueryHelpLinks.propTypes = {
	query: PropTypes.string,
	requestHelpLinks: PropTypes.func,
};

export default connect( null, { requestHelpLinks } )( QueryHelpLinks );
