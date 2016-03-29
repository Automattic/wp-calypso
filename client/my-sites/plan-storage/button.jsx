/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import filesize from 'filesize';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ProgressBar from 'components/progress-bar';

const ALERT_PERCENT = 80;
const WARN_PERCENT = 60;

export default React.createClass( {

	displayName: 'PlanStorageButton',

	propTypes: {
		sitePlanName: React.PropTypes.string.isRequired,
		mediaStorage: React.PropTypes.object,
		onClick: React.PropTypes.func,
		className: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			onClick: noop
		}
	},

	getPlanTranslation() {
		if ( this.props.sitePlanName === 'Premium' ) {
			return this.translate( 'Premium Plan', { context: 'Short plan name on storage button' } );
		} else if ( this.props.sitePlanName === 'Free' ) {
			return this.translate( 'Free Plan', { context: 'Short plan name on storage button' } );
		}
		//This is a fallback if we add a new plan. We ideally want to add any plan levels for proper i18n.
		return this.translate( '%(planName)s Plan', { args: { planName: this.props.sitePlanName } } );
	},

	render() {
		if ( ! this.props.mediaStorage || this.props.mediaStorage.max_storage_bytes === -1 ) {
			return null;
		}
		const percent = Math.min(
			Math.round( this.props.mediaStorage.storage_used_bytes / this.props.mediaStorage.max_storage_bytes * 1000 ) / 10,
			100 );
		const classes = classNames( this.props.className, 'plan-storage__button', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT
		} );
		const max = filesize( this.props.mediaStorage.max_storage_bytes );
		return (
			<Button className={ classes } onClick={ this.props.onClick }>
				<span className="plan-storage__plan-label">
					{ this.getPlanTranslation() }
				</span>
				<span className="plan-storage__storage-label" >
					{ this.translate( '%(percent)f%% of %(max)s used', {
						args: {
							percent: percent,
							max: max
						}
					} ) }
				</span>
				<ProgressBar
					className="plan-storage__bar"
					value={ percent }
					total={ 100 }
					compact={ true } />
				{ this.props.children }
			</Button>
		);
	}
} );
