/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Button from 'components/button';
import Card from 'components/card';
import HoldList from './hold-list';
import QueryEligibility from 'components/data/query-atat-eligibility';
import WarningList from './warning-list';

export const EligibilityWarnings = ( {
	backUrl,
	eligibilityData,
	isEligible,
	isPlaceholder,
	onProceed,
	siteId,
	translate,
} ) => {
	const holds = get( eligibilityData, 'eligibilityHolds', [ 'PLACEHOLDER', 'PLACEHOLDER' ] );
	const warnings = get( eligibilityData, 'eligibilityWarnings', [] );

	const classes = classNames(
		'eligibility-warnings',
		{ 'eligibility-warnings__placeholder': isPlaceholder }
	);

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />

			{ holds.length > 0 && <HoldList holds={ holds } /> }
			{ warnings.length > 0 && <WarningList warnings={ warnings } /> }

			<Card className="eligibility-warnings__confirm-box">
				<div className="eligibility-warnings__confirm-text">
					{ ! isEligible && translate(
						'You must resolve the errors above before proceeding. '
					) }
					{ isEligible && translate(
						'If you proceed you will no longer be able to use these features. '
					) }
					{ translate( 'Have questions? Please {{a}}contact support{{/a}}.',
						{
							components: {
								a: <a href="https://wordpress.com/help/contact" target="_blank" rel="noopener noreferrer" />
							}
						}
					) }
				</div>
				<div className="eligibility-warnings__confirm-buttons">
					<Button href={ backUrl }>
						{ translate( 'Cancel' ) }
					</Button>

					<Button primary={ true } disabled={ ! isEligible } onClick={ onProceed }>
						{ translate( 'Proceed' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
};

EligibilityWarnings.propTypes = {
	onProceed: PropTypes.func,
	backUrl: PropTypes.string,
	translate: PropTypes.func,
};

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		siteId,
	};
};

export default connect( mapStateToProps )( localize( EligibilityWarnings ) );
