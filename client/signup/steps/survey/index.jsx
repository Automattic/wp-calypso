/**
 * External dependencies
 */
import React from 'react';
import { abtest } from 'lib/abtest';

import SurveyStepV1 from './survey-step-v1';
import SurveyStepV2 from './survey-step-v2';

export default React.createClass( {
	displayName: 'SurveyStep',

  render() {
    switch ( abtest( 'signupSurveyStep' ) ) {
      case 'surveyStepV1': return ( <SurveyStepV1 {... this.props } /> );
      case 'surveyStepV2': return ( <SurveyStepV2 {... this.props } /> );
      default: throw new Error( 'Unknown variation' );
    }
  }
} );