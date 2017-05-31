/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'gridicons';
import ProgressBar from 'components/progress-bar';
import Button from 'components/button';

class ActivityLogBanner extends Component {

	static propTypes = {
		isRestoring: PropTypes.bool,
		isProblem: PropTypes.bool,
		progress: PropTypes.number,
	};

	static defaultProps = {
		isRestoring: false,
		isProblem: false,
		progress: 100,
	};

	isRestoring() {
		const {
			translate,
			progress,
		} = this.props;

		return (
			<div>
				<h2 className="activity-log-banner__content-title">{ translate( 'Currently restoring your site' ) }</h2>
				<div className="activity-log-banner__content-body">
					{
						translate( "We're in the process of restoring your site to %(date)s. ", {
							args: {
								// todo: change with real date data
								date: 'March 17, 2017'
							}
						} )
					}
					<br />
					{
						translate( "You'll receive a notification once it's complete!" )
					}
				</div>
				<div className="activity-log-banner__content-meta"><em>{
					translate( 'Currently restoring posts…' )
				}</em></div>
				<ProgressBar value={ progress } compact isPulsing />
			</div>
		);
	}

	hasProblem() {
		const {
			translate,
		} = this.props;

		return (
			<div>
				<Gridicon icon="cross-small" onClick={ noop } />
				<h2 className="activity-log-banner__content-title">{ translate( 'Problem restoring your site' ) }</h2>
				<div className="activity-log-banner__content-body">
					{ translate( 'We came across a problem while trying to restore your site.' ) }
				</div>
				<Button primary >
					{ translate( 'Try again' ) }
				</Button>
				<Button>
					{ translate( 'Get help' ) }
				</Button>
			</div>
		);
	}

	getContent() {
		const {
			isRestoring,
			isProblem
		} = this.props;

		return (
			<div className="activity-log-banner__content">
				{ isRestoring && this.isRestoring() }
				{ isProblem && this.hasProblem() }
			</div>
		);
	}

	render() {
		return (
			<Card className="activity-log-banner">
				<div className="activity-log-banner__icon">
					<Gridicon icon="info" size={ 24 } />
				</div>
				{ this.getContent() }
			</Card>
		);
	}
}

export default localize( ActivityLogBanner );
