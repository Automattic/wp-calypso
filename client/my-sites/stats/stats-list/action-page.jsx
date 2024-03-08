/* eslint-disable jsx-a11y/anchor-is-valid */
import page from '@automattic/calypso-router';
import { Icon, chartBar } from '@wordpress/icons';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

const debug = debugFactory( 'calypso:stats:action-page' );

class StatsActionPage extends Component {
	static displayName = 'StatsActionPage';

	clickHandler = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
		debug( 'handling page click', this.props );
		gaRecordEvent(
			'Stats',
			'Clicked on Summary Link in ' + this.props.moduleName + ' List Action Menu'
		);

		page( this.props.page );
	};

	render() {
		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className="module-content-list-item-action-wrapper"
					title={ this.props.translate( 'View in a new window', {
						textOnly: true,
						context: 'Stats action tooltip: View content in a new window',
					} ) }
					aria-label={ this.props.translate( 'View in a new window', {
						textOnly: true,
						context: 'Stats ARIA label: View content in a new window',
					} ) }
				>
					<Icon className="stats-icon" icon={ chartBar } size={ 18 } />
					<span className="module-content-list-item-action-label">
						{ this.props.translate( 'View', {
							context: 'Stats: List item action to view content',
						} ) }
					</span>
				</a>
			</li>
		);
	}
}

export default localize( StatsActionPage );
