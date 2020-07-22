/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import canCurrentUser from 'state/selectors/can-current-user';
import { planHasFeature, isBusinessPlan, isEcommercePlan } from 'lib/plans';
import { FEATURE_UNLIMITED_STORAGE } from 'lib/plans/constants';
import PlanStorageBar from './bar';

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
				<a className={ classNames( className, 'plan-storage' ) } href={ `/plans/${ siteSlug }` }>
					{ planStorageComponents }
				</a>
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
} )( PlanStorage );
