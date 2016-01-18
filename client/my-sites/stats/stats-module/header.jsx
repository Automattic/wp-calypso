/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import analytics from 'analytics';
import titlecase from 'to-title-case';

export default React.createClass( {
	displayName: 'StatsModuleHeader',

	propTypes: {
		siteId: PropTypes.number,
		path: PropTypes.string,
		title: PropTypes.string,
		showInfo: PropTypes.bool,
		showModule: PropTypes.bool,
		isCollapsed: PropTypes.bool,
		showCollapse: PropTypes.bool,
		onActionClick: PropTypes.func.isRequired
	},

	getDefaultProps() {
		return {
			showCollapse: true,
			showModule: true
		}
	},

	toggleInfo: function( event ) {
		event.stopPropagation();
		event.preventDefault();
		const { path, onActionClick, showInfo } = this.props;
		const gaEvent = showInfo ? 'Closed' : 'Opened';

		if ( path ) {
			analytics.ga.recordEvent( 'Stats', gaEvent + ' More Information Panel', titlecase( path ) );
		}

		onActionClick( {
			showInfo: ! showInfo
		} );
	},

	toggleModule: function( event ) {
		event.preventDefault();
		const { path, onActionClick, showModule } = this.props;
		const gaEvent = showModule ? 'Collapsed' : 'Expanded';

		if ( path ) {
			analytics.ga.recordEvent( 'Stats', gaEvent + ' Module', titlecase( path ) );
		}

		onActionClick( {
			showModule: ! showModule
		} );
	},

	renderChevron() {
		return (
			<li className="module-header-action toggle-services">
				<a
					href="#"
					className="module-header-action-link"
					aria-label={
						this.translate(
							'Expand or collapse panel',
							{ context: 'Stats panel action' }
						)
					}
					title={
						this.translate(
							'Expand or collapse panel',
							{ context: 'Stats panel action' }
						)
					}
					onClick={
						this.toggleModule
					}
				>
					<Gridicon icon="chevron-down" />
				</a>
			</li>
		);
	},

	render() {
		const { showCollapse, showInfo, title } = this.props;
		const infoIcon = showInfo ? 'info' : 'info-outline';

		return (
			<div className="module-header">
				<h4 className="module-header-title">{ title }</h4>
				<ul className="module-header-actions">
					<li className="module-header-action toggle-info">
						<a href="#"
							className="module-header-action-link"
							aria-label={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
							title={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
							onClick={ this.toggleInfo }
						>
							<Gridicon icon={ infoIcon } />
						</a>
					</li>
					{ showCollapse ? this.renderChevron() : null }
				</ul>
			</div>
		);
	}
} );
