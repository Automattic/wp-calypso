/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { setTitle } from 'state/ui/actions';

class QueryTitle extends Component {
	componentWillMount() {
		this.props.setTitle( this.props.title );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.title !== nextProps.title ) {
			nextProps.setTitle( nextProps.title );
		}
	}

	render() {
		return null;
	}
}

QueryTitle.propTypes = {
	title: PropTypes.string,
	setTitle: PropTypes.func.isRequired
};

QueryTitle.defaultProps = {
	title: ''
};

export default connect( null, ( dispatch ) => {
	return bindActionCreators( {
		setTitle
	}, dispatch );
} )( QueryTitle );
