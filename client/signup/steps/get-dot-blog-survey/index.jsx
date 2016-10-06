// External dependencies
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import page from 'page';

// Internal dependencies
import { getCurrentUser } from 'state/current-user/selectors';
import { getStepUrl } from 'signup/utils';
import SurveyStepV1 from 'signup/steps/survey/survey-step-v1';

class GetDotBlogSurvey extends Component {
	constructor( props ) {
		super( props );
	}

	componentWillMount() {
		const { user, queryObject } = this.props;

		if ( ! user || ! queryObject || ! queryObject.domain ) {
			// Only existing, logged in users landing here with a `domain`
			// querystring  can create a site through the `get-dot-blog` flow
			page.redirect( getStepUrl( 'main' ) );
		}
	}

	render() {
		return (
			<SurveyStepV1 { ...this.props } />
		);
	}
}

GetDotBlogSurvey.propTypes = {
	queryObject: PropTypes.object,
	user: PropTypes.object,
};

export default connect(
	( state ) => ( {
		user: getCurrentUser( state ),
	} )
)( GetDotBlogSurvey );
