/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingHelpCourses } from 'state/help/courses/selectors';
import { requestHelpCourses } from 'state/help/courses/actions';

class QueryHelpCourses extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool,
		requestHelpCourses: PropTypes.func
	}

	componentWillMount() {
		if ( this.props.isRequesting ) {
			return;
		}

		this.props.requestHelpCourses();
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => {
		return {
			isRequesting: isRequestingHelpCourses( state )
		};
	},
	{ requestHelpCourses }
)( QueryHelpCourses );
