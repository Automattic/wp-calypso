/**
 * Exernal dependencies
 */
var isEmpty = require( 'lodash/lang/isEmpty' ),
	find = require( 'lodash/collection/find' ),
	indexOf = require( 'lodash/array/indexOf' ),
	pick = require( 'lodash/object/pick' );

/**
 * Internal dependencies
 */
var i18nUtils = require( 'lib/i18n-utils' ),
	steps = require( 'signup/config/steps' ),
	flows = require( 'signup/config/flows' ),
	defaultFlowName = require( 'signup/config/flows' ).defaultFlowName;

function getFlowName( parameters ) {
	var currentFlowName = flows.currentFlowName;
	if ( parameters.flowName && isFlowName( parameters.flowName ) ) {
		return parameters.flowName;
	}

	if ( ! isFlowName( parameters.flowName ) && currentFlowName === defaultFlowName ) {
		return defaultFlowName;
	}

	return currentFlowName;
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
		locale = localeSlug ? `/${ localeSlug }` : '';

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

module.exports = {
	getFlowName: getFlowName,
	getStepName: getStepName,
	getLocale: getLocale,
	getStepSectionName: getStepSectionName,
	getStepUrl: getStepUrl,
	getValidPath: getValidPath,
	getPreviousStepName: getPreviousStepName,
	getNextStepName: getNextStepName
};
