/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

class StatsActionLink extends PureComponent {
	static propTypes = {
		href: PropTypes.string,
		moduleName: PropTypes.string,
		translate: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.onClick = this.onClick.bind( this );
	}

	onClick( event ) {
		event.stopPropagation();
		analytics.ga.recordEvent( 'Stats', 'Clicked on External Link in ' + this.props.moduleName + ' List Action Menu' );
	}

	render() {
		const { href, translate } = this.props;
		return (
			<li className="module-content-list-item-action">
				<a href={ href }
					onClick={ this.onClick }
					target="_blank"
					rel="noopener noreferrer"
					className="module-content-list-item-action-wrapper"
					title={ translate( 'View content in a new window', {
						textOnly: true, context: 'Stats action tooltip: View content in a new window'
					} ) }
					aria-label={ translate( 'View content in a new window', {
						textOnly: true, context: 'Stats ARIA label: View content in new window action'
					} ) } >
					<Gridicon icon="external" size={ 18 } />
					<span className="module-content-list-item-action-label module-content-list-item-action-label-view">
						{ translate( 'View', { context: 'Stats: List item action to view content' } ) }
					</span>
				</a>
			</li>
		);
	}
}

export default localize( StatsActionLink );
