/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, map, without } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import Spinner from 'components/spinner';
import {
	getJetpackOnboardingCompletedSteps,
	getJetpackOnboardingPendingSteps,
} from 'state/selectors';
import {
	JETPACK_ONBOARDING_STEP_TITLES as STEP_TITLES,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';

const CompletedSteps = ( { siteSlug, steps, stepsCompleted, stepsPending } ) =>
	map( without( steps, STEPS.SUMMARY ), stepName => {
		const isCompleted = get( stepsCompleted, stepName ) === true;
		const isPending = get( stepsPending, stepName );
		const className = classNames( 'steps__summary-entry', isCompleted ? 'completed' : 'todo' );

		return (
			<div key={ stepName } className={ className }>
				{ isPending ? (
					<Spinner size={ 18 } />
				) : (
					<Gridicon icon={ isCompleted ? 'checkmark' : 'cross' } size={ 18 } />
				) }
				<a href={ `/jetpack/onboarding/${ stepName }/${ siteSlug }` }>
					{ STEP_TITLES[ stepName ] }
				</a>
			</div>
		);
	} );

export default connect( ( state, { siteId, steps } ) => ( {
	stepsCompleted: getJetpackOnboardingCompletedSteps( state, siteId, steps ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( CompletedSteps ) );
