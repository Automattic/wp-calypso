/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchState } from 'lib/importer/actions';
import SignupActions from 'lib/signup/actions';

class ImportProcessingComponent extends Component {
	// @TODO this is not working
	getSiteIdFromDependencies = () => get( this.props, 'signupDependencies.siteId' );

	componentDidMount() {
		const siteId = this.getSiteIdFromDependencies();
		console.log( { d: this.props.signupDependencies } );
		if ( ! siteId ) {
			// @TODO this should not happen. throw an error
			return;
		}

		fetchState( siteId ).then( r => {
			console.log( { fetchStateResponse: r } );
			SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
				importSessionId: 42,
			} );
			this.props.goToNextStep();
		} );
	}

	render() {
		return <div>One sec, starting your import.</div>;
	}
}

export default ImportProcessingComponent;
