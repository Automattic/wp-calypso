/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { difference, filter, get, includes, noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, FEATURE_UPLOAD_PLUGINS, FEATURE_UPLOAD_THEMES } from 'lib/plans/constants';
import { isBusiness, isEnterprise } from 'lib/products-values';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import Banner from 'components/banner';
import Button from 'components/button';
import Card from 'components/card';
import HoldList from './hold-list';
import Notice from 'components/notice';
import QueryEligibility from 'components/data/query-atat-eligibility';
import WarningList from './warning-list';

export const EligibilityWarnings = ( {
	backUrl,
	eligibilityData,
	hasBusinessPlan,
	isEligible,
	isJetpack,
	isPlaceholder,
	onProceed,
	siteId,
	siteSlug,
	translate,
} ) => {
	const context = -1 !== backUrl.indexOf( 'plugins' ) ? 'plugins' : 'themes';

	const warnings = get( eligibilityData, 'eligibilityWarnings', [] );

	let holds = get( eligibilityData, 'eligibilityHolds', [ 'PLACEHOLDER', 'PLACEHOLDER' ] );
	const bannerHolds = filter( holds, hold => -1 !== [ 'NO_BUSINESS_PLAN', 'NOT_USING_CUSTOM_DOMAIN' ].indexOf( hold ) );
	holds = difference( holds, bannerHolds );

	const classes = classNames(
		'eligibility-warnings',
		{ 'eligibility-warnings__placeholder': isPlaceholder }
	);

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />

			{ 'plugins' === context && ! hasBusinessPlan && ! isJetpack &&
				<Banner
					description={ translate( 'Please upgrade to install this plugin.' ) }
					feature={ FEATURE_UPLOAD_PLUGINS }
					plan={ PLAN_BUSINESS }
					title={ translate( 'Business plan required' ) }
				/>
			}
			{ 'themes' === context && ! hasBusinessPlan && ! isJetpack &&
				<Banner
					description={ translate( 'Unlimited themes, advanced customization, no ads, live chat support, and more!' ) }
					feature={ FEATURE_UPLOAD_THEMES }
					plan={ PLAN_BUSINESS }
					title={ translate( 'To upload themes, upgrade to Business Plan' ) }
				/>
			}
			{ hasBusinessPlan && ! isJetpack && includes( bannerHolds, 'NOT_USING_CUSTOM_DOMAIN' ) &&
				<Banner
					className="eligibility-warnings__banner"
					description={ translate( 'Add a free custom domain to install this plugin.' ) }
					href={ `/domains/add/${ siteSlug }` }
					icon="domains"
					title={ translate( 'Custom domain required' ) }
				/>
			}

			{ holds.length > 0 && <HoldList holds={ holds } /> }
			{ warnings.length > 0 && <WarningList warnings={ warnings } /> }

			{ isEligible && 0 === holds.length && 0 === warnings.length &&
				<Notice
					showDismiss={ false }
					status="is-success"
					text={ translate( 'No conflicts detected.' ) }
				/>
			}

			<Card className="eligibility-warnings__confirm-box">
				<div className="eligibility-warnings__confirm-text">
					{ ! isEligible && translate(
						'You must resolve the errors above before proceeding. '
					) }
					{ isEligible && warnings.length > 0 && translate(
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
	const {
		ID: siteId,
		plan,
		slug: siteSlug,
	} = getSelectedSite( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const hasBusinessPlan = isBusiness( plan ) || isEnterprise( plan );
	const isJetpack = isJetpackSite( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		hasBusinessPlan,
		isEligible,
		isJetpack,
		isPlaceholder: ! dataLoaded,
		siteId,
		siteSlug,
	};
};

export default connect( mapStateToProps )( localize( EligibilityWarnings ) );
