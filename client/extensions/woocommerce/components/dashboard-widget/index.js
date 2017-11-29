/**
 *
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { isUndefined, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Popover from 'components/popover';
import Tooltip from 'components/tooltip';

class DashboardWidget extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false,
			showTooltip: false,
		};
	}

	hideTooltip = () => {
		this.setState( { showTooltip: false } );
	};

	onSettingsPanelClose = () => {
		this.setState( { showDialog: false } );
		this.props.onSettingsClose();
	};

	setSettingsToggle = c => {
		this.settingsToggle = c;
	};

	showTooltip = () => {
		this.setState( { showTooltip: true } );
	};

	toggleSettingsPanel = () => {
		const { showDialog } = this.state;
		if ( showDialog ) {
			this.props.onSettingsClose();
		}
		this.setState( { showDialog: ! showDialog } );
	};

	render() {
		const {
			children,
			className,
			image,
			imageFlush,
			imagePosition,
			settingsPanel,
			title,
			translate,
			width,
		} = this.props;
		const { showDialog, showTooltip } = this.state;
		const isTopImage = image && 'top' === imagePosition;
		const imageClassName = image ? `is-${ imagePosition }` : null;
		const widthClassName = `is-${ width }-width`;
		const hasSettingsPanel = ! isUndefined( settingsPanel );

		const classes = classNames( 'dashboard-widget', className, imageClassName, widthClassName, {
			'is-flush-image': imageFlush,
			'has-settings-panel': hasSettingsPanel,
		} );

		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		const imageComponent = <img className="dashboard-widget__image" src={ image } />;

		return (
			<Card className={ classes }>
				<Gridicon
					className="dashboard-widget__settings-toggle"
					icon="cog"
					onClick={ this.toggleSettingsPanel }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
					ref={ this.setSettingsToggle }
					size={ 18 }
				/>
				<Tooltip
					baseClassName="dashboard-widget__settings-tooltip"
					context={ this.settingsToggle }
					isVisible={ showTooltip }
				>
					{ translate( 'Settings', {
						comment: 'Tooltip shown to toggle settings panel in dashboard',
					} ) }
				</Tooltip>
				{ hasSettingsPanel && (
					<Popover
						className="dashboard-widget__settings-popover"
						context={ this.settingsToggle }
						isVisible={ showDialog }
						onClose={ this.onSettingsPanelClose }
						position="bottom left"
					>
						{ settingsPanel }
					</Popover>
				) }
				<div className="dashboard-widget__content">
					{ isTopImage && imageComponent }
					{ image && 'left' === imagePosition && imageComponent }
					<div className="dashboard-widget__children">
						{ title && <h2 className="dashboard-widget__title">{ title }</h2> }
						{ children }
					</div>
					{ image && 'right' === imagePosition && imageComponent }
					{ image && 'bottom' === imagePosition && imageComponent }
				</div>
			</Card>
		);
	}
}

DashboardWidget.propTypes = {
	className: PropTypes.string,
	image: PropTypes.string,
	imageFlush: PropTypes.bool,
	imagePosition: PropTypes.oneOf( [ 'bottom', 'left', 'right', 'top' ] ),
	onSettingsClose: PropTypes.func,
	title: PropTypes.string,
	settingsPanel: PropTypes.element,
	width: PropTypes.oneOf( [ 'half', 'full', 'third', 'two-thirds' ] ),
};

DashboardWidget.defaultProps = {
	imagePosition: 'top',
	imageFlush: false,
	onSettingsClose: noop,
	width: 'full',
};

export default localize( DashboardWidget );
