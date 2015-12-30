/**
 * External dependencies
 */
import React from 'react';
import property from 'lodash/utility/property';
import config from 'config';
import classNames from 'classnames';
import analytics from 'analytics';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import DropdownSeparator from 'components/select-dropdown/separator';
import BulkSelect from 'components/bulk-select';
import PluginsActions from 'lib/plugins/actions';

export default React.createClass( {
	displayName: 'Plugins-list-header',

	propTypes: {
		label: React.PropTypes.string,
		isBulkManagementActive: React.PropTypes.bool,
		toggleBulkManagement: React.PropTypes.func.isRequired,
		updateAllPlugins: React.PropTypes.func.isRequired,
		pluginUpdateCount: React.PropTypes.number.isRequired,
		activateSelected: React.PropTypes.func.isRequired,
		deactiveAndDisconnectSelected: React.PropTypes.func.isRequired,
		deactivateSelected: React.PropTypes.func.isRequired,
		setAutoupdateSelected: React.PropTypes.func.isRequired,
		unsetAutoupdateSelected: React.PropTypes.func.isRequired,
		removePluginNotice: React.PropTypes.func.isRequired,
		haveActiveSelected: React.PropTypes.bool,
		haveInactiveSelected: React.PropTypes.bool,
		bulkManagement: React.PropTypes.bool,
		sites: React.PropTypes.object.isRequired,
		plugins: React.PropTypes.array.isRequired,
		selected: React.PropTypes.array.isRequired,
		isWpCom: React.PropTypes.bool
	},

	onBrowserLinkClick() {
		analytics.ga.recordEvent( 'Plugins', 'Clicked Add New Plugins' );
	},

	canAddNewPlugins() {
		if ( config.isEnabled( 'manage/plugins/browser' ) ) {
			return this.hasJetpackSelectedSites();
		}
		return false;
	},

	canUpdatePlugins() {
		return this.props.plugins
			.filter( plugin => plugin.selected )
			.some( plugin => plugin.sites.some( site => site.canUpdateFiles ) );
	},

	hasJetpackSelectedSites() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( selectedSite ) {
			return !! selectedSite.jetpack;
		}
		return this.props.sites.getJetpack().length > 0;
	},

	unselectOrSelectAll() {
		if ( this.props.selected.length > 0 ) {
			PluginsActions.selectPlugins( this.props.sites.getSelectedOrAllWithPlugins(), 'none' );
			analytics.ga.recordEvent( 'Plugins', 'Clicked to Uncheck All Plugins' );
			return;
		}
		PluginsActions.selectPlugins( this.props.sites.getSelectedOrAllWithPlugins(), 'all' );
		analytics.ga.recordEvent( 'Plugins', 'Clicked to Check All Plugins' );
	},

	renderCurrentActionButtons( isWpCom ) {
		let buttons = [];
		let rightSideButtons = [];
		let leftSideButtons = [];
		let updateButtons = [];
		let activateButtons = [];

		const hasWpcomPlugins = this.props.selected.some( property( 'wpcom' ) );
		const isJetpackSelected = this.props.plugins.some( plugin => plugin.selected && 'jetpack' === plugin.slug );
		const needsRemoveButton = this.props.selected.length && ! hasWpcomPlugins && this.canUpdatePlugins() && ! isJetpackSelected;
		if ( ! this.props.isBulkManagementActive ) {
			if ( ! isWpCom && 0 < this.props.pluginUpdateCount ) {
				rightSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-update-all">
						<Button compact primary onClick={ this.props.updateAllPlugins } >
							{ this.translate( 'Update All', { context: 'button label' } ) }
						</Button>
					</ButtonGroup>
				);
			}
			rightSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-bulk-management">
					<Button compact onClick={ this.props.toggleBulkManagement }>
						{ this.translate( 'Edit All', { context: 'button label' } ) }
					</Button>
				</ButtonGroup>
			);
			if ( ! isWpCom && this.canAddNewPlugins() ) {
				const selectedSite = this.props.sites.getSelectedSite();
				const browserUrl = '/plugins/browse' + ( selectedSite ? '/' + selectedSite.slug : '' );

				rightSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-browser">
						<Button compact href={ browserUrl } onClick={ this.onBrowserLinkClick } className="plugin-list-header__browser-button">
							<Gridicon key="plus-icon" icon="plus-small" size={ 12 } /><Gridicon key="plugins-icon" icon="plugins" size={ 18 } />
						</Button>
					</ButtonGroup>
				);
			}
		} else {
			activateButtons.push(
				<Button key="plugin-list-header__buttons-activate" disabled={ ! this.props.haveInactiveSelected } compact onClick={ this.props.activateSelected }>
					{ this.translate( 'Activate' ) }
				</Button>
			);
			let deactivateButton = isJetpackSelected
				? (
					<Button compact
						key="plugin-list-header__buttons-deactivate"
						disabled={ ! this.props.haveActiveSelected }
						onClick={ this.props.deactiveAndDisconnectSelected }>
						{ this.translate( 'Disconnect' ) }
					</Button>
				)
				: (
					<Button compact
						key="plugin-list-header__buttons-disable"
						disabled={ ! this.props.haveActiveSelected }
						onClick={ this.props.deactivateSelected }>
						{ this.translate( 'Deactivate' ) }
					</Button>
				);
			activateButtons.push( deactivateButton )
			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-activate-buttons">{ activateButtons }</ButtonGroup> );

			if ( this.hasJetpackSelectedSites() && ! isWpCom ) {
				updateButtons.push(
					<Button key="plugin-list-header__buttons-autoupdate-on"
						disabled={ hasWpcomPlugins || ! this.canUpdatePlugins() }
						compact
						onClick={ this.props.setAutoupdateSelected }>
						{ this.translate( 'Autoupdate' ) }
					</Button>
				);
				updateButtons.push(
					<Button key="plugin-list-header__buttons-autoupdate-off"
						disabled={ hasWpcomPlugins || ! this.canUpdatePlugins() }
						compact
						onClick={ this.props.unsetAutoupdateSelected }>
						{ this.translate( 'Disable Autoupdates' ) }
					</Button>
				);

				leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-update-buttons">{ updateButtons }</ButtonGroup> );
				leftSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-remove-button">
						<Button compact scary
							disabled={ ! needsRemoveButton }
							onClick={ this.props.removePluginNotice }>
							{ this.translate( 'Remove' ) }
						</Button>
					</ButtonGroup>
				);
			}

			rightSideButtons.push(
				<button key="plugin-list-header__buttons-close-button"
					className="plugin-list-header__section-actions-close"
					onClick={ this.props.toggleBulkManagement }>
					<span className="screen-reader-text">{ this.translate( 'Close' ) }</span>
					<Gridicon icon="cross" />
				</button>
			);
		}

		buttons.push( <span key="plugin-list-header__buttons-action-buttons" className="plugin-list-header__action-buttons">{ leftSideButtons }</span> );
		buttons.push( <span key="plugin-list-header__buttons-global-buttons" className="plugin-list-header__mode-buttons">{ rightSideButtons }</span> );

		return buttons;
	},

	renderCurrentActionDropdown() {
		let options = [];
		let actions = [];

		const hasWpcomPlugins = this.props.selected.some( property( 'wpcom' ) );
		const isJetpackSelected = this.props.plugins.some( plugin => plugin.selected && 'jetpack' === plugin.slug );
		const needsRemoveButton = !! this.props.selected.length && ! hasWpcomPlugins && this.canUpdatePlugins() && ! isJetpackSelected;

		if ( this.props.isBulkManagementActive ) {
			options.push( <DropdownItem key="plugin__actions_title" selected={ true } value="Actions">{ this.translate( 'Actions' ) }</DropdownItem> );
			options.push( <DropdownSeparator key="plugin__actions_separator_1" /> );

			options.push(
				<DropdownItem key="plugin__actions_activate"
					disabled={ ! this.props.haveInactiveSelected }
					onClick={ this.props.activateSelected }>
					{ this.translate( 'Activate' ) }
				</DropdownItem>
			);

			let deactivateAction = isJetpackSelected
				? <DropdownItem key="plugin__actions_disconnect"
					disabled={ ! this.props.haveActiveSelected }
					onClick={ this.props.deactiveAndDisconnectSelected }>
						{ this.translate( 'Disconnect' ) }
					</DropdownItem>
				: <DropdownItem key="plugin__actions_deactivate"
					disabled={ ! this.props.haveActiveSelected }
					onClick={ this.props.deactivateSelected }>
						{ this.translate( 'Deactivate' ) }
					</DropdownItem>;
			options.push( deactivateAction );

			if ( this.hasJetpackSelectedSites() ) {
				options.push( <DropdownSeparator key="plugin__actions_separator_2" /> );
				options.push(
					<DropdownItem key="plugin__actions_autoupdate"
						disabled={ hasWpcomPlugins || ! this.canUpdatePlugins() }
						onClick={ this.props.setAutoupdateSelected }>
						{ this.translate( 'Autoupdate' ) }
					</DropdownItem>
				);
				options.push(
					<DropdownItem key="plugin__actions_disable_autoupdate"
						disabled={ hasWpcomPlugins || ! this.canUpdatePlugins() }
						onClick={ this.props.unsetAutoupdateSelected }>
						{ this.translate( 'Disable Autoupdates' ) }
					</DropdownItem>
				);

				options.push( <DropdownSeparator key="plugin__actions_separator_3" /> );
				options.push(
					<DropdownItem key="plugin__actions_remove"
						className="plugin-list-header__actions_remove_item"
						disabled={ ! needsRemoveButton }
						onClick={ this.props.removePluginNotice } >
						{ this.translate( 'Remove' ) }
					</DropdownItem>
				);
			}

			actions.push(
				<SelectDropdown compact
					className="plugin-list-header__actions_dropdown"
					key="plugin-list-header__actions_dropdown"
					selectedText="Actions">
					{ options }
				</SelectDropdown>
			);
		}
		return actions;
	},

	render() {
		const sectionClasses = classNames( 'plugin-list-header', { 'is-bulk-editing': this.props.isBulkManagementActive } );
		return (
			<SectionHeader label={ this.props.label } className={ sectionClasses }>
				{
					this.props.isBulkManagementActive &&
						<BulkSelect key="plugin-list-header__bulk-select"
							totalElements={ this.props.plugins.length }
							selectedElements={ this.props.selected.length }
							onToggle={ this.unselectOrSelectAll } />
				}
				{ this.renderCurrentActionDropdown() }
				{ this.renderCurrentActionButtons( this.props.isWpCom ) }
			</SectionHeader>
		);
	}
} );
