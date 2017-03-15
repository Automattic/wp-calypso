/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, includes, noop, partition } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

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
	const context = includes( backUrl, 'plugins' ) ? 'plugins' : 'themes';

	const warnings = get( eligibilityData, 'eligibilityWarnings', [] );

	const [ bannerHolds, listHolds ] = partition(
		get( eligibilityData, 'eligibilityHolds', [] ),
		hold => includes( [ 'NO_BUSINESS_PLAN', 'NOT_USING_CUSTOM_DOMAIN' ], hold ),
	);

	const classes = classNames(
		'eligibility-warnings',
		{ 'eligibility-warnings__placeholder': isPlaceholder }
	);

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />

			{ ! hasBusinessPlan && ! isJetpack &&
				<Banner
					description={ translate( 'Also get unlimited themes, advanced customization, no ads, live chat support, and more!' ) }
					feature={ 'plugins' === context
						? FEATURE_UPLOAD_PLUGINS
						: FEATURE_UPLOAD_THEMES
					}
					plan={ PLAN_BUSINESS }
					title={ translate( 'Business plan required' ) }
				/>
			}
			{ hasBusinessPlan && ! isJetpack && includes( bannerHolds, 'NOT_USING_CUSTOM_DOMAIN' ) &&
				<Banner
					className="eligibility-warnings__banner"
					description={ 'plugins' === context
						? translate( 'To install this plugin, add a free custom domain.' )
						: translate( 'To upload themes, add a free custom domain.' )
					}
					href={ `/domains/add/${ siteSlug }` }
					icon="domains"
					title={ translate( 'Custom domain required' ) }
				/>
			}

			{ ( isPlaceholder || listHolds.length > 0 ) &&
				<HoldList holds={ listHolds } isPlaceholder={ isPlaceholder } />
			}
			{ warnings.length > 0 &&
				<WarningList warnings={ warnings } />
			}

			{ isEligible && 0 === listHolds.length && 0 === warnings.length &&
				<Card className="eligibility-warnings__no-conflicts">
					<Gridicon icon="thumbs-up" size={ 24 } />
					<span>
						{ translate( 'This site is eligible to install plugins and upload themes.' ) }
					</span>
				</Card>
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
