/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import DropdownSeparator from 'components/select-dropdown/separator';
import BulkSelect from 'components/bulk-select';
import Tooltip from 'components/tooltip';
import analytics from 'lib/analytics';

// Constants help determin if the action bar should be a dropdown
const MAX_ACTIONBAR_HEIGHT = 50;
const MIN_ACTIONBAR_WIDTH = 600;

export class PluginsListHeader extends PureComponent {

	state = {
		actionBarVisible: true,
		addPluginTooltip: false
	}

	static defaultProps = {
		isMock: false,
		disabled: false,
	}

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
		selected: PropTypes.array.isRequired
	}

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
		this.setState( { actionBarVisible: true } );
		setTimeout( () => {
			const actionBarVisible = actionBarDomElement.offsetHeight <= MAX_ACTIONBAR_HEIGHT;
			this.setState( { actionBarVisible } );
		}, 1 );
	}

	showPluginTooltip = () => {
		this.setState( { addPluginTooltip: true } );
	}

	hidePluginTooltip = () => {
		this.setState( { addPluginTooltip: false } );
	}

	toggleBulkManagement = () => {
		this.props.toggleBulkManagement();

		this.maybeMakeActionBarVisible();
	}

	afterResize = () => {
		if ( this.props.isBulkManagementActive ) {
			this.maybeMakeActionBarVisible();
		}
	}

	onBrowserLinkClick = () => {
		analytics.ga.recordEvent( 'Plugins', 'Clicked Add New Plugins' );
	}

	unselectOrSelectAll = () => {
		const { plugins, selected } = this.props;
		const someSelected = selected.length > 0;
		this.props.setSelectionState( plugins, ! someSelected );
		analytics.ga.recordEvent( 'Plugins', someSelected ? 'Clicked to Uncheck All Plugins' : 'Clicked to Check All Plugins' );
	}

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
						<Button compact primary onClick={ this.props.updateAllPlugins } >
							{
								translate(
									'Update %(numUpdates)d Plugin',
									'Update %(numUpdates)d Plugins',
									{
										context: 'button label',
										count: this.props.pluginUpdateCount,
										args: {
											numUpdates: this.props.pluginUpdateCount
										}
									}
								)
							}
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
			const browserUrl = '/plugins/browse' + ( this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '' );

			rightSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-browser">
					<Button
						compact
						href={ browserUrl }
						onClick={ this.onBrowserLinkClick }
						className="plugin-list-header__browser-button"
						onMouseEnter={ this.showPluginTooltip }
						onMouseLeave={ this.hidePluginTooltip }
						ref="addPluginButton"
						aria-label={ translate( 'Browse all plugins', { context: 'button label' } ) }>
						<Gridicon key="plus-icon" icon="plus-small" size={ 18 } /><Gridicon key="plugins-icon" icon="plugins" size={ 18 } />
						<Tooltip
							isVisible={ this.state.addPluginTooltip }
							context={ this.refs && this.refs.addPluginButton }
							position="bottom">
							{ translate( 'Browse all plugins', { context: 'button tooltip' } ) }
						</Tooltip>
					</Button>
				</ButtonGroup>
			);
		} else {
			const updateButton = (
				<Button
					key="plugin-list-header__buttons-update"
					disabled={ ! this.props.haveUpdatesSelected }
					compact primary
					onClick={ this.props.updateSelected }>
					{ translate( 'Update' ) }
				</Button>
			);
			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-update-button">{ updateButton }</ButtonGroup> );

			activateButtons.push(
				<Button
					key="plugin-list-header__buttons-activate"
					disabled={ ! this.props.haveInactiveSelected }
					onClick={ this.props.activateSelected }
					compact >
					{ translate( 'Activate' ) }
				</Button>
			);

			activateButtons.push(
				<Button compact
					key="plugin-list-header__buttons-deactivate"
					disabled={ ! this.props.haveActiveSelected }
					onClick={ isJetpackSelected
						? this.props.deactiveAndDisconnectSelected
						: this.props.deactivateSelected
						} >
					{ translate( 'Deactivate' ) }
				</Button>
			);

			if ( ! ( isJetpackSelected && this.props.selected.length === 1 ) ) {
				leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-activate-buttons">{ activateButtons }</ButtonGroup> );
			}

			autoupdateButtons.push(
				<Button key="plugin-list-header__buttons-autoupdate-on"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.setAutoupdateSelected }>
					{ translate( 'Autoupdate' ) }
				</Button>
			);
			autoupdateButtons.push(
				<Button key="plugin-list-header__buttons-autoupdate-off"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.unsetAutoupdateSelected }>
					{ translate( 'Disable Autoupdates' ) }
				</Button>
			);

			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-update-buttons">{ autoupdateButtons }</ButtonGroup> );
			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-remove-button">
					<Button compact scary
						disabled={ ! needsRemoveButton }
						onClick={ this.props.removePluginNotice }>
						{ translate( 'Remove' ) }
					</Button>
				</ButtonGroup>
			);

			rightSideButtons.push(
				<button key="plugin-list-header__buttons-close-button"
					className="plugin-list-header__section-actions-close"
					onClick={ this.props.toggleBulkManagement }>
					<span className="plugin-list-header__screen-reader-text">{ translate( 'Close' ) }</span>
					<Gridicon icon="cross" />
				</button>
			);
		}

		buttons.push(
			<span
				key="plugin-list-header__buttons-action-buttons"
				className="plugin-list-header__action-buttons">
				{ leftSideButtons }
			</span>
		);

		buttons.push(
			<span
				key="plugin-list-header__buttons-global-buttons"
				className="plugin-list-header__mode-buttons">
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
			<SelectDropdown compact
				className="plugin-list-header__actions-dropdown"
				key="plugin-list-header__actions_dropdown"
				selectedText={ translate( 'Actions' ) } >

				<DropdownItem key="plugin__actions_title" selected={ true } value="Actions">
					{ translate( 'Actions' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_1" />

				<DropdownItem key="plugin__actions_activate"
						disabled={ ! this.props.haveUpdatesSelected }
						onClick={ this.props.updateSelected }>
					{ translate( 'Update' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_1" />
				{ isJetpackOnlySelected &&
					<DropdownItem key="plugin__actions_activate"
							disabled={ ! this.props.haveInactiveSelected }
							onClick={ this.props.activateSelected }>
						{ translate( 'Activate' ) }
					</DropdownItem>
				}
				{ isJetpackOnlySelected &&
					<DropdownItem key="plugin__actions_disconnect"
							disabled={ ! this.props.haveActiveSelected }
							onClick={ isJetpackSelected
								? this.props.deactiveAndDisconnectSelected
								: this.props.deactivateSelected }>
						{ translate( 'Deactivate' ) }
					</DropdownItem>
				}

				<DropdownSeparator key="plugin__actions_separator_2" />

				<DropdownItem key="plugin__actions_autoupdate"
						disabled={ ! this.canUpdatePlugins() }
						onClick={ this.props.setAutoupdateSelected }>
					{ translate( 'Autoupdate' ) }
				</DropdownItem>

				<DropdownItem key="plugin__actions_disable_autoupdate"
						disabled={ ! this.canUpdatePlugins() }
						onClick={ this.props.unsetAutoupdateSelected }>
					{ translate( 'Disable Autoupdates' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_3" />

				<DropdownItem
					key="plugin__actions_remove"
					className="plugin-list-header__actions-remove-item"
					disabled={ ! needsRemoveButton }
					onClick={ this.props.removePluginNotice } >
					{ translate( 'Remove' ) }
				</DropdownItem>
			</SelectDropdown>
		);
	}

	render() {
		const { label, selected, plugins, isBulkManagementActive } = this.props;
		const sectionClasses = classNames( {
			'plugin-list-header': true,
			'is-bulk-editing': isBulkManagementActive,
			'is-action-bar-visible': this.state.actionBarVisible
		} );
		return (
			<SectionHeader label={ label } className={ sectionClasses }>
				{
					isBulkManagementActive &&
						<BulkSelect key="plugin-list-header__bulk-select"
							totalElements={ plugins.length }
							selectedElements={ selected.length }
							onToggle={ this.unselectOrSelectAll } />
				}
				{ this.renderCurrentActionDropdown() }
				{ this.renderCurrentActionButtons() }
			</SectionHeader>
		);
	}
}

export default localize( PluginsListHeader );
