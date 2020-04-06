/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import ButtonGroup from 'components/button-group';
import { Button } from '@automattic/components';
import SelectDropdown from 'components/select-dropdown';
import BulkSelect from 'components/bulk-select';
import { gaRecordEvent } from 'lib/analytics/ga';

/**
 * Style dependencies
 */
import './style.scss';

// Constants help determine if the action bar should be a dropdown
const MAX_ACTIONBAR_HEIGHT = 57;
const MIN_ACTIONBAR_WIDTH = 600;

export class PluginsListHeader extends PureComponent {
	state = {
		actionBarVisible: true,
	};

	static defaultProps = {
		isMock: false,
		disabled: false,
	};

	static propTypes = {
		label: PropTypes.string,
		isBulkManagementActive: PropTypes.bool,
		toggleBulkManagement: PropTypes.func.isRequired,
		updateAllPlugins: PropTypes.func.isRequired,
		updateSelected: PropTypes.func.isRequired,
		haveUpdatesSelected: PropTypes.bool,
		pluginUpdateCount: PropTypes.number.isRequired,
		activateSelected: PropTypes.func.isRequired,
		deactiveAndDisconnectSelected: PropTypes.func.isRequired,
		deactivateSelected: PropTypes.func.isRequired,
		setAutoupdateSelected: PropTypes.func.isRequired,
		setSelectionState: PropTypes.func.isRequired,
		unsetAutoupdateSelected: PropTypes.func.isRequired,
		removePluginNotice: PropTypes.func.isRequired,
		haveActiveSelected: PropTypes.bool,
		haveInactiveSelected: PropTypes.bool,
		bulkManagement: PropTypes.bool,
		selectedSiteSlug: PropTypes.string,
		plugins: PropTypes.array.isRequired,
		selected: PropTypes.array.isRequired,
	};

	componentDidMount() {
		this.debouncedAfterResize = debounce( this.afterResize, 100 );
		window.addEventListener( 'resize', this.debouncedAfterResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedAfterResize );
	}

	maybeMakeActionBarVisible() {
		const actionBarDomElement = findDOMNode( this );
		if ( actionBarDomElement.offsetWidth < MIN_ACTIONBAR_WIDTH ) {
			return;
		}
		setTimeout( () => {
			const actionBarVisible = actionBarDomElement.offsetHeight <= MAX_ACTIONBAR_HEIGHT;
			this.setState( { actionBarVisible } );
		}, 1 );
	}

	toggleBulkManagement = () => {
		this.props.toggleBulkManagement();

		this.maybeMakeActionBarVisible();
	};

	afterResize = () => {
		if ( this.props.isBulkManagementActive ) {
			this.maybeMakeActionBarVisible();
		}
	};

	unselectOrSelectAll = () => {
		const { plugins, selected } = this.props;
		const someSelected = selected.length > 0;
		this.props.setSelectionState( plugins, ! someSelected );
		gaRecordEvent(
			'Plugins',
			someSelected ? 'Clicked to Uncheck All Plugins' : 'Clicked to Check All Plugins'
		);
	};

	isJetpackSelected() {
		return this.props.selected.some( plugin => 'jetpack' === plugin.slug );
	}

	canUpdatePlugins() {
		return this.props.selected.some( plugin => plugin.sites.some( site => site.canUpdateFiles ) );
	}

	needsRemoveButton() {
		return this.props.selected.length && this.canUpdatePlugins() && ! this.isJetpackSelected();
	}

	renderCurrentActionButtons() {
		const { translate } = this.props;
		const isJetpackSelected = this.isJetpackSelected();
		const needsRemoveButton = this.needsRemoveButton();
		const buttons = [];
		const rightSideButtons = [];
		const leftSideButtons = [];
		const autoupdateButtons = [];
		const activateButtons = [];

		if ( ! this.props.isBulkManagementActive ) {
			if ( 0 < this.props.pluginUpdateCount ) {
				rightSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-update-all">
						<Button compact primary onClick={ this.props.updateAllPlugins }>
							{ translate( 'Update %(numUpdates)d Plugin', 'Update %(numUpdates)d Plugins', {
								context: 'button label',
								count: this.props.pluginUpdateCount,
								args: {
									numUpdates: this.props.pluginUpdateCount,
								},
							} ) }
						</Button>
					</ButtonGroup>
				);
			}
			rightSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-bulk-management">
					<Button compact onClick={ this.toggleBulkManagement }>
						{ translate( 'Edit All', { context: 'button label' } ) }
					</Button>
				</ButtonGroup>
			);
		} else {
			const updateButton = (
				<Button
					key="plugin-list-header__buttons-update"
					disabled={ ! this.props.haveUpdatesSelected }
					compact
					primary
					onClick={ this.props.updateSelected }
				>
					{ translate( 'Update' ) }
				</Button>
			);
			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-update-button">{ updateButton }</ButtonGroup>
			);

			activateButtons.push(
				<Button
					key="plugin-list-header__buttons-activate"
					disabled={ ! this.props.haveInactiveSelected }
					onClick={ this.props.activateSelected }
					compact
				>
					{ translate( 'Activate' ) }
				</Button>
			);

			activateButtons.push(
				<Button
					compact
					key="plugin-list-header__buttons-deactivate"
					disabled={ ! this.props.haveActiveSelected }
					onClick={
						isJetpackSelected
							? this.props.deactiveAndDisconnectSelected
							: this.props.deactivateSelected
					}
				>
					{ translate( 'Deactivate' ) }
				</Button>
			);

			if ( ! ( isJetpackSelected && this.props.selected.length === 1 ) ) {
				leftSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-activate-buttons">
						{ activateButtons }
					</ButtonGroup>
				);
			}

			autoupdateButtons.push(
				<Button
					key="plugin-list-header__buttons-autoupdate-on"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.setAutoupdateSelected }
				>
					{ translate( 'Autoupdate' ) }
				</Button>
			);
			autoupdateButtons.push(
				<Button
					key="plugin-list-header__buttons-autoupdate-off"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.unsetAutoupdateSelected }
				>
					{ translate( 'Disable Autoupdates' ) }
				</Button>
			);

			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-update-buttons">
					{ autoupdateButtons }
				</ButtonGroup>
			);
			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-remove-button">
					<Button
						compact
						scary
						disabled={ ! needsRemoveButton }
						onClick={ this.props.removePluginNotice }
					>
						{ translate( 'Remove' ) }
					</Button>
				</ButtonGroup>
			);

			rightSideButtons.push(
				<button
					key="plugin-list-header__buttons-close-button"
					className="plugin-list-header__section-actions-close"
					onClick={ this.props.toggleBulkManagement }
					aria-label={ translate( 'Close' ) }
				>
					<Gridicon icon="cross" />
				</button>
			);
		}

		buttons.push(
			<span
				key="plugin-list-header__buttons-action-buttons"
				className="plugin-list-header__action-buttons"
			>
				{ leftSideButtons }
			</span>
		);

		buttons.push(
			<span
				key="plugin-list-header__buttons-global-buttons"
				className="plugin-list-header__mode-buttons"
			>
				{ rightSideButtons }
			</span>
		);

		return buttons;
	}

	renderCurrentActionDropdown() {
		const { translate, selected, isBulkManagementActive } = this.props;
		if ( ! isBulkManagementActive ) {
			return null;
		}

		const isJetpackSelected = this.isJetpackSelected();
		const needsRemoveButton = this.needsRemoveButton();
		const isJetpackOnlySelected = ! ( isJetpackSelected && selected.length === 1 );
		return (
			<SelectDropdown
				compact
				className="plugin-list-header__actions-dropdown"
				selectedText={ translate( 'Actions' ) }
			>
				<SelectDropdown.Item selected value="Actions">
					{ translate( 'Actions' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />

				<SelectDropdown.Item
					disabled={ ! this.props.haveUpdatesSelected }
					onClick={ this.props.updateSelected }
				>
					{ translate( 'Update' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ ! this.props.haveInactiveSelected }
						onClick={ this.props.activateSelected }
					>
						{ translate( 'Activate' ) }
					</SelectDropdown.Item>
				) }
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ ! this.props.haveActiveSelected }
						onClick={
							isJetpackSelected
								? this.props.deactiveAndDisconnectSelected
								: this.props.deactivateSelected
						}
					>
						{ translate( 'Deactivate' ) }
					</SelectDropdown.Item>
				) }

				<SelectDropdown.Separator />

				<SelectDropdown.Item
					disabled={ ! this.canUpdatePlugins() }
					onClick={ this.props.setAutoupdateSelected }
				>
					{ translate( 'Autoupdate' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Item
					disabled={ ! this.canUpdatePlugins() }
					onClick={ this.props.unsetAutoupdateSelected }
				>
					{ translate( 'Disable Autoupdates' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />

				<SelectDropdown.Item
					className="plugin-list-header__actions-remove-item"
					disabled={ ! needsRemoveButton }
					onClick={ this.props.removePluginNotice }
				>
					{ translate( 'Remove' ) }
				</SelectDropdown.Item>
			</SelectDropdown>
		);
	}

	render() {
		const { label, selected, plugins, isBulkManagementActive } = this.props;
		const sectionClasses = classNames( {
			'plugin-list-header': true,
			'is-bulk-editing': isBulkManagementActive,
			'is-action-bar-visible': this.state.actionBarVisible,
		} );
		return (
			<SectionHeader label={ label } className={ sectionClasses }>
				{ isBulkManagementActive && (
					<BulkSelect
						key="plugin-list-header__bulk-select"
						totalElements={ plugins.length }
						selectedElements={ selected.length }
						onToggle={ this.unselectOrSelectAll }
					/>
				) }
				{ this.renderCurrentActionDropdown() }
				{ this.renderCurrentActionButtons() }
			</SectionHeader>
		);
	}
}

export default localize( PluginsListHeader );
