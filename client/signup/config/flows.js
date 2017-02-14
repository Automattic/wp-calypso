/**
 * External dependencies
 */
import { assign, includes, reject } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import stepConfig from './steps';
import userFactory from 'lib/user';
import flowsData from './flows-configuration';

const user = userFactory();

class Flows {
	defaultFlowName = 'main';
	resumingFlow = false;

	constructor() {
		if ( ! ( this instanceof Flows ) ) {
			return new Flows();
		}
	}

	filterFlowName( flowName ) {
		const defaultFlows = [ 'main', 'website' ];

		/**
		 * Only run the User First Signup for logged out users.
		 */
		if ( ! user.get() ) {
			if ( includes( defaultFlows, flowName ) && abtest( 'userFirstSignup' ) === 'userFirst' ) {
				return 'user-first';
			}
		}

		return flowName;
	}

	filterDesignTypeInFlow( flow ) {
		if ( ! flow ) {
			return;
		}

		if ( ! includes( flow.steps, 'design-type' ) || 'designTypeWithStore' !== abtest( 'signupStore' ) ) {
			return flow;
		}

		return assign( {}, flow, {
			steps: flow.steps.map( stepName => stepName === 'design-type' ? 'design-type-with-store' : stepName )
		} );
	}

	/**
	 * Filters the Flow destination if needed.
	 *
	 * Usually empty, but it can be used to filter the destination in order to do AB tests or override it.
	 *
	 * @param {String} destination The target destination
	 * @param {Object} dependencies Signup's dependencies
	 * @param {String} flowName The name of the flow
	 * @returns {String} The flow where the user will be redirected to.
	 */
	filterDestination( destination, dependencies, flowName ) {
		return destination;
	}

	removeUserStepFromFlow( flow ) {
		if ( ! flow ) {
			return;
		}

		return assign( {}, flow, {
			steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken )
		} );
	}

	/**
	 * Get certain flow from the flows configuration.
	 *
	 * The returned flow is modified according to several filters.
	 *
	 * `currentStepName` is the current step in the signup flow. It is used
	 * to determine if any AB variations should be assigned after it is completed.
	 * Example use case: To determine if a new signup step should be part of the flow or not.
	 *
	 * @param {String} flowName The name of the flow to return
	 * @param {String} currentStepName The current step. See description above
	 * @returns {Object} A flow object
	 */
	getFlow = ( flowName, currentStepName = '' ) => {
		let flow = this.getFlows()[ flowName ];

		// if the flow couldn't be found, return early
		if ( ! flow ) {
			return flow;
		}

		if ( user.get() ) {
			flow = this.removeUserStepFromFlow( flow );
		}

		// Show design type with store option only to new users with EN locale.
		if ( ! user.get() && 'en' === i18n.getLocaleSlug() ) {
			flow = this.filterDesignTypeInFlow( flow );
		}

		this.preloadABTestVariationsForStep( flowName, currentStepName );

		return this.getABTestFilteredFlow( flowName, flow );
	};

	getFlows() {
		return flowsData;
	}

	/**
	 * Preload AB Test variations after a certain step has been completed.
	 *
	 * This gives the option to set the AB variation as late as possible in the
	 * signup flow.
	 *
	 * Currently only the `main` flow is whitelisted.
	 *
	 * @param {String} flowName The current flow
	 * @param {String} stepName The step that is being completed right now
	 */
	preloadABTestVariationsForStep = ( flowName, stepName ) => {
		/**
		 * In cases where the flow is being resumed, the flow must not be changed from what the user
		 * has seen before.
		 *
		 * E.g. A user is resuming signup from before the test was added. There is no need
		 * to add a step somewhere back in the line.
		 */
		if ( this.resumingFlow ) {
			return;
		}

		/**
		 * If there is need to test the first step in a flow,
		 * the best way to do it is to check for:
		 *
		 * 	if ( '' === stepName ) { ... }
		 *
		 * This will be fired at the beginning of the signup flow.
		 */
		if ( 'main' === flowName ) {
			if ( '' === stepName ) {
				abtest( 'siteTitleStep' );
			}
		}
	};

	/**
	 * Return a flow that is modified according to the ABTest rules.
	 *
	 * Useful when testing new steps in the signup flows.
	 *
	 * Example usage: Inject or remove a step in the flow if a user is part of an ABTest.
	 *
	 * @param {String} flowName The current flow name
	 * @param {Object} flow The flow object
	 *
	 * @return {Object} A filtered flow object
	 */
	getABTestFilteredFlow = ( flowName, flow ) => {
		// Only do this on the main flow
		if ( 'main' === flowName ) {
			if ( abtest( 'signupSurveyStep' ) === 'showSurveyStep' ) {
				return Flows.insertStepIntoFlow( 'survey', flow );
			}
		}

		return flow;
	};

	/**
	 * Insert a step into the flow.
	 *
	 * @param {String} stepName The step to insert into the flow
	 * @param {Object} flow The flow that the step will be inserted into
	 * @param {String} afterStep After which step to insert the new step.
	 * 							 If left blank, the step will be added in the beginning.
	 *
	 * @returns {Object} A flow object with inserted step
	 */
	insertStepIntoFlow( stepName, flow, afterStep = '' ) {
		if ( -1 === flow.steps.indexOf( stepName ) ) {
			const steps = flow.steps.slice();
			const afterStepIndex = steps.indexOf( afterStep );

			/**
			 * Only insert the step if
			 * `afterStep` is empty ( insert at start )
			 * or if `afterStep` is found in the flow. ( insert after `afterStep` )
			 */
			if ( afterStepIndex > -1 || '' === afterStep ) {
				steps.splice( afterStepIndex + 1, 0, stepName );

				return {
					...flow,
					steps,
				};
			}
		}

		return flow;
	}

	removeStepFromFlow( stepName, flow ) {
		return {
			...flow,
			steps: flow.steps.filter( ( step ) => {
				return step !== stepName;
			} )
		};
	}
}

export default new Flows();
