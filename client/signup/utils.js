/**
 * Exernal dependencies
 */
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import indexOf from 'lodash/indexOf';
import pick from 'lodash/pick';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import steps from 'signup/config/steps';
import flows from 'signup/config/flows';
import { defaultFlowName } from 'signup/config/flows';
import formState from 'lib/form-state';
const user = require( 'lib/user' )();

function getFlowName( parameters ) {
	const flow = ( parameters.flowName && isFlowName( parameters.flowName ) ) ? parameters.flowName : defaultFlowName;
	return maybeFilterFlowName( flow, flows.filterFlowName );
}

function maybeFilterFlowName( flowName, filterCallback ) {
	if ( filterCallback && typeof filterCallback === 'function' ) {
		const filteredFlow = filterCallback( flowName );
		if ( isFlowName( filteredFlow ) ) {
			return filteredFlow;
		}
	}
	return flowName;
}

function isFlowName( pathFragment ) {
	return ! isEmpty( flows.getFlow( pathFragment ) );
}

function getStepName( parameters ) {
	return find( pick( parameters, [ 'flowName', 'stepName' ] ), isStepName );
}

function isStepName( pathFragment ) {
	return ! isEmpty( steps[ pathFragment ] );
}

function getStepSectionName( parameters ) {
	return find( pick( parameters, [ 'stepName', 'stepSectionName' ] ), isStepSectionName );
}

function isStepSectionName( pathFragment ) {
	return ! isStepName( pathFragment ) && ! isLocale( pathFragment );
}

function getLocale( parameters ) {
	return find( pick( parameters, [ 'flowName', 'stepName', 'stepSectionName', 'lang' ] ), isLocale );
}

function isLocale( pathFragment ) {
	return ! isEmpty( i18nUtils.getLanguage( pathFragment ) );
}

function getStepUrl( flowName, stepName, stepSectionName, localeSlug ) {
	const flow = flowName ? `/${ flowName }` : '',
		step = stepName ? `/${ stepName }` : '',
		section = stepSectionName ? `/${ stepSectionName }` : '',
		// when the user is logged in, the locale slug is meaningless in a
		// signup URL, as the page will be translated in the language the user
		// has in their settings.
		locale = localeSlug && ! user.get() ? `/${ localeSlug }` : '';

	if ( flowName === defaultFlowName ) {
		// we don't include the default flow name in the route
		return '/start' + step + section + locale;
	}

	return '/start' + flow + step + section + locale;
}

function getValidPath( parameters ) {
	var locale = getLocale( parameters ),
		flowName = getFlowName( parameters ),
		currentFlowSteps = flows.getFlow( flowName ).steps,
		stepName = getStepName( parameters ) || currentFlowSteps[ 0 ],
		stepSectionName = getStepSectionName( parameters );

	if ( currentFlowSteps.length === 0 ) {
		return '/';
	}

	return getStepUrl( flowName, stepName, stepSectionName, locale );
}

function getPreviousStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) - 1 ];
}

function getNextStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) + 1 ];
}

function getFlowSteps( flowName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps;
}

function getValueFromProgressStore( { signupProgress, stepName, fieldName } ) {
	const siteStepProgress = find(
		signupProgress,
		step => step.stepName === stepName
	);
	return siteStepProgress ? siteStepProgress[ fieldName ] : null;
}

function mergeFormWithValue( { form, fieldName, fieldValue} ) {
	if ( ! formState.getFieldValue( form, fieldName ) ) {
		return merge( form, {
			[ fieldName ]: { value: fieldValue }
		} );
	}
	return form;
}

function getDestination( destination, dependencies, flowName ) {
	return flows.filterDestination( destination, dependencies, flowName );
}

export default {
	getFlowName: getFlowName,
	getFlowSteps: getFlowSteps,
	getStepName: getStepName,
	getLocale: getLocale,
	getStepSectionName: getStepSectionName,
	getStepUrl: getStepUrl,
	getValidPath: getValidPath,
	getPreviousStepName: getPreviousStepName,
	getNextStepName: getNextStepName,
	getValueFromProgressStore: getValueFromProgressStore,
	getDestination: getDestination,
	mergeFormWithValue: mergeFormWithValue
};
