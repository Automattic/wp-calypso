/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import Gridicon from 'components/gridicon';

const debug = debugFactory( 'calypso:stats:action-page' );

class StatsActionPage extends React.Component {
	static displayName = 'StatsActionPage';

	clickHandler = event => {
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
					<Gridicon icon="stats" size={ 18 } />
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
