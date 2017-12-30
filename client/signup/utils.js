/** @format **/
/**
 * Exernal dependencies
 */
import { filter, find, indexOf, isEmpty, merge, pick } from 'lodash';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import steps from 'signup/config/steps';
import flows, { defaultFlowName } from 'signup/config/flows';
import formState from 'lib/form-state';
import userFactory from 'lib/user';
const user = userFactory();

export function getFlowName( parameters ) {
	const flow =
		parameters.flowName && isFlowName( parameters.flowName )
			? parameters.flowName
			: defaultFlowName;
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

export function getStepName( parameters ) {
	return find( pick( parameters, [ 'flowName', 'stepName' ] ), isStepName );
}

function isStepName( pathFragment ) {
	return ! isEmpty( steps[ pathFragment ] );
}

export function getStepSectionName( parameters ) {
	return find( pick( parameters, [ 'stepName', 'stepSectionName' ] ), isStepSectionName );
}

function isStepSectionName( pathFragment ) {
	return ! isStepName( pathFragment ) && ! isLocale( pathFragment );
}

export function getLocale( parameters ) {
	return find(
		pick( parameters, [ 'flowName', 'stepName', 'stepSectionName', 'lang' ] ),
		isLocale
	);
}

function isLocale( pathFragment ) {
	return ! isEmpty( i18nUtils.getLanguage( pathFragment ) );
}

export function getStepUrl( flowName, stepName, stepSectionName, localeSlug ) {
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

export function getValidPath( parameters ) {
	const locale = getLocale( parameters ),
		flowName = getFlowName( parameters ),
		currentFlowSteps = flows.getFlow( flowName ).steps,
		stepName = getStepName( parameters ) || currentFlowSteps[ 0 ],
		stepSectionName = getStepSectionName( parameters );

	if ( currentFlowSteps.length === 0 ) {
		return '/';
	}

	return getStepUrl( flowName, stepName, stepSectionName, locale );
}

export function getPreviousStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) - 1 ];
}

export function getNextStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) + 1 ];
}

export function getFlowSteps( flowName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps;
}

export function getValueFromProgressStore( { signupProgress, stepName, fieldName } ) {
	const siteStepProgress = find( signupProgress, step => step.stepName === stepName );
	return siteStepProgress ? siteStepProgress[ fieldName ] : null;
}

export function mergeFormWithValue( { form, fieldName, fieldValue } ) {
	if ( ! formState.getFieldValue( form, fieldName ) ) {
		return merge( form, {
			[ fieldName ]: { value: fieldValue },
		} );
	}
	return form;
}

export function getDestination( destination, dependencies, flowName ) {
	return flows.filterDestination( destination, dependencies, flowName );
}

export function getThemeForDesignType( designType ) {
	switch ( designType ) {
		case 'blog':
			return 'pub/independent-publisher-2';
		case 'grid':
			return 'pub/altofocus';
		case 'page':
			return 'pub/dara';
		case 'store':
			return 'pub/dara';
		default:
			return 'pub/twentyseventeen';
	}
}

export function getThemeForSiteGoals( siteGoals ) {
	const siteGoalsValue = siteGoals.split( ',' );

	if ( siteGoalsValue.indexOf( 'sell' ) !== -1 ) {
		return 'pub/dara';
	}

	if ( siteGoalsValue.indexOf( 'promote' ) !== -1 ) {
		return 'pub/dara';
	}

	if ( siteGoalsValue.indexOf( 'educate' ) !== -1 ) {
		return 'pub/twentyfifteen';
	}

	if ( siteGoalsValue.indexOf( 'showcase' ) !== -1 ) {
		return 'pub/altofocus';
	}

	return 'pub/independent-publisher-2';
}

export function getSiteTypeForSiteGoals( siteGoals ) {
	const siteGoalsValue = siteGoals.split( ',' );

	//Identify stores for the store signup flow
	if ( siteGoals === 'sell' ) {
		return 'store';
	}

	if ( siteGoalsValue.indexOf( 'sell' ) !== -1 ) {
		return 'page';
	}

	if ( siteGoalsValue.indexOf( 'promote' ) !== -1 ) {
		return 'page';
	}

	if ( siteGoalsValue.indexOf( 'showcase' ) !== -1 ) {
		return 'portfolio';
	}

	return 'blog';
}

export function canResumeFlow( flowName, progress ) {
	const flow = flows.getFlow( flowName );
	const flowStepsInProgressStore = filter(
		progress,
		step => -1 !== flow.steps.indexOf( step.stepName )
	);

	return flowStepsInProgressStore.length > 0 && ! flow.disallowResume;
}
