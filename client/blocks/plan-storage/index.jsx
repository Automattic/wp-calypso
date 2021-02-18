/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'calypso/components/data/query-media-storage';
import { getMediaStorage } from 'calypso/state/sites/media-storage/selectors';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { planHasFeature, isBusinessPlan, isEcommercePlan } from 'calypso/lib/plans';
import { FEATURE_UNLIMITED_STORAGE } from 'calypso/lib/plans/constants';
import PlanStorageBar from './bar';
import Tooltip from './tooltip';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			canUserUpgrade,
			canViewBar,
			className,
			jetpackSite,
			atomicSite,
			siteId,
			sitePlanSlug,
			siteSlug,
			translate,
		} = this.props;

		if ( ( jetpackSite && ! atomicSite ) || ! canViewBar || ! sitePlanSlug ) {
			return null;
		}

		if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
			return null;
		}

		const planHasTopStorageSpace =
			isBusinessPlan( sitePlanSlug ) || isEcommercePlan( sitePlanSlug );

		const displayUpgradeLink = canUserUpgrade && ! planHasTopStorageSpace;

		const planStorageComponents = (
			<>
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					sitePlanSlug={ sitePlanSlug }
					mediaStorage={ this.props.mediaStorage }
					displayUpgradeLink={ displayUpgradeLink }
				>
					{ this.props.children }
				</PlanStorageBar>
			</>
		);

		if ( displayUpgradeLink ) {
			return (
				<Tooltip
					title={ translate( 'Upgrade your plan to increase your storage space.' ) }
					className="plan-storage__tooltip"
				>
					<a className={ classNames( className, 'plan-storage' ) } href={ `/plans/${ siteSlug }` }>
						{ planStorageComponents }
					</a>
				</Tooltip>
			);
		}
		return (
			<div className={ classNames( className, 'plan-storage' ) }>{ planStorageComponents }</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	return {
		mediaStorage: getMediaStorage( state, siteId ),
		jetpackSite: isJetpackSite( state, siteId ),
		atomicSite: isAtomicSite( state, siteId ),
		sitePlanSlug: getSitePlanSlug( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		canUserUpgrade: canCurrentUser( state, siteId, 'manage_options' ),
		canViewBar: canCurrentUser( state, siteId, 'publish_posts' ),
	};
} )( localize( PlanStorage ) );
