/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSite } from 'state/sites/selectors';
import PlanStorageBar from './bar';

class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
	};

	render() {
		const { className, site, siteId } = this.props;

		if ( ! site || site.jetpack ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) } >
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					siteSlug={ site.Slug }
					sitePlanName={ site.plan.product_name_short }
					mediaStorage={ this.props.mediaStorage }
				>
					{ this.props.children }
				</PlanStorageBar>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		mediaStorage: getMediaStorage( state, ownProps.siteId ),
		site: getSite( state, ownProps.siteId )
	};
} )( PlanStorage );
