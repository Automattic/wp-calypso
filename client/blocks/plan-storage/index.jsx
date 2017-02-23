/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSite } from 'state/sites/selectors';
import PlanStorageButton from './button';

const PlanStorage = React.createClass( {

	propTypes: {
		className: React.PropTypes.string,
		mediaStorage: React.PropTypes.object,
		siteId: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onClick: noop
		}
	},

	render() {
		if ( ! this.props.site || this.props.site.jetpack ) {
			return null;
		}
		const classes = classNames( this.props.className, 'plan-storage' );
		return (
			<div className={ classes } >
				<QueryMediaStorage siteId={ this.props.siteId } />
				<PlanStorageButton
					sitePlanName={ this.props.site.plan.product_name_short }
					mediaStorage={ this.props.mediaStorage }
					onClick={ this.props.onClick } >
					{ this.props.children }
				</PlanStorageButton>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		mediaStorage: getMediaStorage( state, ownProps.siteId ),
		site: getSite( state, ownProps.siteId )
	};
} )( PlanStorage );
