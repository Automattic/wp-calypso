/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { gaRecordEvent } from 'lib/analytics/ga';

class StatsActionLink extends PureComponent {
	static propTypes = {
		href: PropTypes.string,
		moduleName: PropTypes.string,
		translate: PropTypes.func,
	};

	onClick = ( event ) => {
		event.stopPropagation();
		gaRecordEvent(
			'Stats',
			'Clicked on External Link in ' + this.props.moduleName + ' List Action Menu'
		);
	};

	render() {
		const { href, translate } = this.props;
		return (
			<li className="stats-list__item-action module-content-list-item-action">
				<a
					href={ href }
					onClick={ this.onClick }
					target="_blank"
					rel="noopener noreferrer"
					className="stats-list__item-action-wrapper module-content-list-item-action-wrapper"
					title={ translate( 'View content in a new window', {
						textOnly: true,
						context: 'Stats action tooltip: View content in a new window',
					} ) }
					aria-label={ translate( 'View content in a new window', {
						textOnly: true,
						context: 'Stats ARIA label: View content in new window action',
					} ) }
				>
					<Gridicon icon="external" size={ 18 } />
					<span className="stats-list__item-action-label module-content-list-item-action-label module-content-list-item-action-label-view">
						{ translate( 'View', { context: 'Stats: List item action to view content' } ) }
					</span>
				</a>
			</li>
		);
	}
}

export default localize( StatsActionLink );
