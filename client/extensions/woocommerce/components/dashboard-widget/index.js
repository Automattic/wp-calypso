/**
 *
 * External dependencies
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import { isUndefined, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Popover from 'calypso/components/popover';
import Tooltip from 'calypso/components/tooltip';

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

	settingsToggleRef = React.createRef();

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
			title,
			translate,
			width,
		} = this.props;
		const { showDialog, showTooltip } = this.state;
		const isTopImage = image && 'top' === imagePosition;
		const imageClassName = image ? `is-${ imagePosition }` : null;
		const widthClassName = `is-${ width }-width`;
		const SettingsPanel = this.props.settingsPanel;
		const hasSettingsPanel = ! isUndefined( SettingsPanel );

		const classes = classNames( 'dashboard-widget', className, imageClassName, widthClassName, {
			'is-flush-image': imageFlush,
			'has-settings-panel': hasSettingsPanel,
		} );

		const imageComponent = <img className="dashboard-widget__image" src={ image } alt="" />;

		return (
			<Card className={ classes }>
				<Gridicon
					className="dashboard-widget__settings-toggle"
					icon="cog"
					onClick={ this.toggleSettingsPanel }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
					ref={ this.settingsToggleRef }
					size={ 18 }
				/>
				<Tooltip
					baseClassName="dashboard-widget__settings-tooltip"
					context={ this.settingsToggleRef.current }
					isVisible={ showTooltip }
				>
					{ translate( 'Settings', {
						comment: 'Tooltip shown to toggle settings panel in dashboard',
					} ) }
				</Tooltip>
				{ hasSettingsPanel && (
					<Popover
						className="woocommerce dashboard-widget__settings-popover"
						context={ this.settingsToggleRef.current }
						isVisible={ showDialog }
						onClose={ this.onSettingsPanelClose }
						position="bottom left"
					>
						<SettingsPanel close={ this.onSettingsPanelClose } />
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
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	settingsPanel: PropTypes.func,
	width: PropTypes.oneOf( [ 'half', 'full', 'third', 'two-thirds' ] ),
};

DashboardWidget.defaultProps = {
	imagePosition: 'top',
	imageFlush: false,
	onSettingsClose: noop,
	width: 'full',
};

export default localize( DashboardWidget );
