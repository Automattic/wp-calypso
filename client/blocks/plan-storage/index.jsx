/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSite } from 'state/sites/selectors';
import PlanStorageButton from './bar';

class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
		onClick: PropTypes.func
	};

	static defaultProps = {
		onClick: noop
	}

	render() {
		const { className, site, siteId } = this.props;

		if ( ! site || site.jetpack ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) } >
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageButton
					sitePlanName={ site.plan.product_name_short }
					mediaStorage={ this.props.mediaStorage }
					onClick={ this.props.onClick }
				>
					{ this.props.children }
				</PlanStorageButton>
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
