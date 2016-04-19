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
import PlanStorageButton from 'my-sites/plan-storage/button';
import PlanStorageBar from 'my-sites/plan-storage/bar';

const PlanStorage = React.createClass( {

	propTypes: {
		type: React.PropTypes.string,
		className: React.PropTypes.string,
		mediaStorage: React.PropTypes.object,
		siteId: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			type: 'button',
			onClick: noop
		}
	},

	renderBar() {
		if ( this.props.type === 'bar' ) {
			return (
				<PlanStorageBar
					sitePlanName={ this.props.site.plan.product_name_short }
					mediaStorage={ this.props.mediaStorage }
					onClick={ this.props.onClick }>
					{ this.props.children }
				</PlanStorageBar>
			);
		}
		return null;
	},

	renderButton() {
		if ( this.props.type === 'button' ) {
			return (
				<PlanStorageButton
					sitePlanName={ this.props.site.plan.product_name_short }
					mediaStorage={ this.props.mediaStorage }
					onClick={ this.props.onClick }>
					{ this.props.children }
				</PlanStorageButton>
			);
		}
		return null;
	},

	render() {
		if ( ! this.props.site || this.props.site.jetpack ) {
			return null;
		}
		const classes = classNames( this.props.className, 'plan-storage' );
		return (
			<div className={ classes } >
				<QueryMediaStorage siteId={ this.props.siteId } />
				{ this.renderButton() }
				{ this.renderBar() }
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
