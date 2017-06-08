/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import {
	getSitePlanSlug,
	getSiteSlug,
} from 'state/sites/selectors';
import {
	PLAN_BUSINESS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

import PlanStorageBar from './bar';

/**
 * Constants
 */
const UNLIMITED_STORAGE_PLANS = [
	PLAN_BUSINESS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
];

class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.shape( {
			max_storage_bytes: PropTypes.number.isRequired,
			storage_used_bytes: PropTypes.number.isRequired,
		} ).isRequired,
		siteId: PropTypes.number.isRequired,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		mediaStorage: {
			max_storage_bytes: -1,
			storage_used_bytes: -1,
		},
	};

	render() {
		const {
			className,
			mediaStorage,
			siteId,
			sitePlanSlug,
			siteSlug,
		} = this.props;

		if ( ! sitePlanSlug ) {
			return null;
		}

		if ( includes( UNLIMITED_STORAGE_PLANS, sitePlanSlug ) ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) } >
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ sitePlanSlug }
					mediaStorage={ mediaStorage }
				>
					{ this.props.children }
				</PlanStorageBar>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	return {
		mediaStorage: getMediaStorage( state, siteId ),
		sitePlanSlug: getSitePlanSlug( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( PlanStorage );
