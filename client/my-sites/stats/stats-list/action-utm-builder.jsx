/* eslint-disable jsx-a11y/anchor-is-valid */
import { Icon, link } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';

class StatsActionUTMBuilder extends PureComponent {
	clickHandler = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		// Click handler is provided by the UTMBuilder component
		this.props.onClick?.();
	};

	render() {
		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className="module-content-list-item-action-wrapper"
					title={ this.props.translate( 'View in UTM URL builder', {
						textOnly: true,
						context: 'Stats action tooltip: View in UTM URL builder',
					} ) }
					aria-label={ this.props.translate( 'View in UTM URL builder', {
						textOnly: true,
						context: 'Stats ARIA label: View in UTM URL builder',
					} ) }
				>
					<Icon className="stats-icon" icon={ link } size={ 18 } />
					<span className="module-content-list-item-action-label">
						{ this.props.translate( 'URL' ) }
					</span>
				</a>
			</li>
		);
	}
}

export default localize( StatsActionUTMBuilder );
