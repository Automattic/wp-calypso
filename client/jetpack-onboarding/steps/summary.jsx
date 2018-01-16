/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { compact, get, map, mapValues, without } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Spinner from 'components/spinner';
import { getJetpackOnboardingProgress, getRequest, getUnconnectedSiteUrl } from 'state/selectors';
import {
	JETPACK_ONBOARDING_STEP_TITLES as STEP_TITLES,
	JETPACK_ONBOARDING_STEPS as STEPS,
	JETPACK_ONBOARDING_SUMMARY_STEPS as SUMMARY_STEPS,
} from '../constants';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingSummaryStep extends React.PureComponent {
	renderCompleted = () => {
		const { steps, stepsCompleted, stepsPending } = this.props;

		return map( without( steps, STEPS.SUMMARY ), stepName => {
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
					{ STEP_TITLES[ stepName ] }
				</div>
			);
		} );
	};

	renderTodo = () => {
		const stepsTodo = [
			SUMMARY_STEPS.JETPACK_CONNECTION,
			SUMMARY_STEPS.THEME,
			SUMMARY_STEPS.SITE_ADDRESS,
			SUMMARY_STEPS.STORE,
			SUMMARY_STEPS.BLOG,
		];
		const stepLinks = [
			'/jetpack/connect?url=' + this.props.siteUrl,
			// TODO: update the following with relevant links
			'#',
			'#',
			'#',
			'#',
		];

		return map( stepsTodo, ( fieldLabel, fieldIndex ) => (
			<div key={ fieldIndex } className="steps__summary-entry todo">
				<a href={ stepLinks[ fieldIndex ] }>{ fieldLabel }</a>
			</div>
		) );
	};

	render() {
		const { translate } = this.props;

		const headerText = translate( 'Congratulations! Your site is on its way.' );
		const subHeaderText = translate(
			'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing your site below.'
		);

		// TODO: adapt when we have more info
		const buttonRedirectHref = '#';

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Summary ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.SUMMARY + '/:site' }
					title="Summary ‹ Jetpack Onboarding"
				/>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__summary-columns">
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( "Steps you've completed:" ) }</h3>
						{ this.renderCompleted() }
					</div>
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( 'Continue your site setup:' ) }</h3>
						{ this.renderTodo() }
					</div>
				</div>
				<div className="steps__button-group">
					<Button href={ buttonRedirectHref } primary>
						{ translate( 'Visit your site' ) }
					</Button>
				</div>
			</div>
		);
	}
}

export default connect( ( state, { siteId, steps } ) => {
	const tasks = compact( [] );
	const stepsCompleted = getJetpackOnboardingProgress( state, siteId, steps );

	const stepActionsMap = {
		[ STEPS.WOOCOMMERCE ]: {
			installWooCommerce: true,
		},
	};

	const stepsPending = mapValues(
		stepActionsMap,
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		action => getRequest( state, saveJetpackOnboardingSettings( siteId, action ) ).isLoading
	);

	return {
		siteUrl: getUnconnectedSiteUrl( state, siteId ),
		stepsCompleted,
		stepsPending,
		tasks,
	};
} )( localize( JetpackOnboardingSummaryStep ) );
