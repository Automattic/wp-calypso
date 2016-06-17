/**
 * External dependencies
 */
import React from 'react';
import debounce from 'lodash/debounce';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import analytics from 'lib/analytics';
import isEqual from 'lodash/isEqual';

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
import Tooltip from 'components/tooltip';

const _actionBarVisible = true;

// If the Action
const MAX_ACTIONBAR_HEIGHT = 50;
const MIN_ACTIONBAR_WIDTH = 600;

function checkPropsChange( nextProps, propArr ) {
	for ( let i = 0; i < propArr.length; i++ ) {
		const prop = propArr[ i ];

		if ( nextProps[ prop ] !== this.props[ prop ] ) {
			return true;
		}
	}
	return false;
}

export default React.createClass( {
	displayName: 'Plugins-list-header',

	propTypes: {
		label: React.PropTypes.string,
		isBulkManagementActive: React.PropTypes.bool,
		toggleBulkManagement: React.PropTypes.func.isRequired,
		updateAllPlugins: React.PropTypes.func.isRequired,
		updateSelected: React.PropTypes.func.isRequired,
		haveUpdatesSelected: React.PropTypes.bool,
		pluginUpdateCount: React.PropTypes.number.isRequired,
		activateSelected: React.PropTypes.func.isRequired,
		deactiveAndDisconnectSelected: React.PropTypes.func.isRequired,
		deactivateSelected: React.PropTypes.func.isRequired,
		setAutoupdateSelected: React.PropTypes.func.isRequired,
		setSelectionState: React.PropTypes.func.isRequired,
		unsetAutoupdateSelected: React.PropTypes.func.isRequired,
		removePluginNotice: React.PropTypes.func.isRequired,
		haveActiveSelected: React.PropTypes.bool,
		haveInactiveSelected: React.PropTypes.bool,
		bulkManagement: React.PropTypes.bool,
		selectedSiteSlug: React.PropTypes.string,
		plugins: React.PropTypes.array.isRequired,
		selected: React.PropTypes.array.isRequired
	},

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'label', 'isBulkManagementActive', 'haveUpdatesSelected', 'pluginUpdateCount', 'haveActiveSelected', 'haveInactiveSelected', 'bulkManagement' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.plugins.length !== nextProps.plugins.length ) {
			return true;
		}

		if ( ! isEqual( this.props.sites, nextProps.sites ) ) {
			return true;
		}

		if ( this.props.selected.length !== nextProps.selected.length ) {
			return true;
		}

		if ( this.state.actionBarVisible !== nextState.actionBarVisible ) {
			return true;
		}

		if ( this.state.addPluginTooltip !== nextState.addPluginTooltip ) {
			return true;
		}

		return false;
	},

	getInitialState() {
		return {
			actionBarVisible: _actionBarVisible,
			addPluginTooltip: false
		};
	},

	componentDidMount() {
		this.debouncedAfterResize = debounce( this.afterResize, 100 );
		window.addEventListener( 'resize', this.debouncedAfterResize );
	},

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedAfterResize );
	},

	afterResize() {
		if ( this.props.isBulkManagementActive ) {
			this.maybeMakeActionBarVisible();
		}
	},

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
	},

	showPluginTooltip() {
		this.setState( { addPluginTooltip: true } );
	},

	hidePluginTooltip() {
		this.setState( { addPluginTooltip: false } );
	},

	toggleBulkManagement() {
		this.props.toggleBulkManagement();

		this.maybeMakeActionBarVisible();
	},

	onBrowserLinkClick() {
		analytics.ga.recordEvent( 'Plugins', 'Clicked Add New Plugins' );
	},

	canUpdatePlugins() {
		return this.props.selected.some( plugin => plugin.sites.some( site => site.canUpdateFiles ) );
	},

	unselectOrSelectAll() {
		const someSelected = this.props.selected.length > 0;
		this.props.setSelectionState( this.props.plugins, ! someSelected );
		analytics.ga.recordEvent( 'Plugins', someSelected ? 'Clicked to Uncheck All Plugins' : 'Clicked to Check All Plugins' );
	},

	renderCurrentActionButtons() {
		const isJetpackSelected = this.props.selected.some( plugin => 'jetpack' === plugin.slug ),
			needsRemoveButton = this.props.selected.length && this.canUpdatePlugins() && ! isJetpackSelected,
			buttons = [],
			rightSideButtons = [],
			leftSideButtons = [],
			autoupdateButtons = [],
			activateButtons = [];

		if ( ! this.props.isBulkManagementActive ) {
			if ( 0 < this.props.pluginUpdateCount ) {
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
					<Button compact onClick={ this.toggleBulkManagement }>
						{ this.translate( 'Edit All', { context: 'button label' } ) }
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
						aria-label={ this.translate( 'Browse all plugins', { context: 'button label' } ) }>
						<Gridicon key="plus-icon" icon="plus-small" size={ 18 } /><Gridicon key="plugins-icon" icon="plugins" size={ 18 } />
						<Tooltip
							isVisible={ this.state.addPluginTooltip }
							context={ this.refs && this.refs.addPluginButton }
							position="bottom">
							{ this.translate( 'Browse all plugins', { context: 'button tooltip' } ) }
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
					{ this.translate( 'Update' ) }
				</Button>
			);
			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-update-button">{ updateButton }</ButtonGroup> );

			activateButtons.push(
				<Button key="plugin-list-header__buttons-activate" disabled={ ! this.props.haveInactiveSelected } compact onClick={ this.props.activateSelected }>
					{ this.translate( 'Activate' ) }
				</Button>
			);
			const deactivateButton = isJetpackSelected
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
			activateButtons.push( deactivateButton );
			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-activate-buttons">{ activateButtons }</ButtonGroup> );

			autoupdateButtons.push(
				<Button key="plugin-list-header__buttons-autoupdate-on"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.setAutoupdateSelected }>
					{ this.translate( 'Autoupdate' ) }
				</Button>
			);
			autoupdateButtons.push(
				<Button key="plugin-list-header__buttons-autoupdate-off"
					disabled={ ! this.canUpdatePlugins() }
					compact
					onClick={ this.props.unsetAutoupdateSelected }>
					{ this.translate( 'Disable Autoupdates' ) }
				</Button>
			);

			leftSideButtons.push( <ButtonGroup key="plugin-list-header__buttons-update-buttons">{ autoupdateButtons }</ButtonGroup> );
			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-remove-button">
					<Button compact scary
						disabled={ ! needsRemoveButton }
						onClick={ this.props.removePluginNotice }>
						{ this.translate( 'Remove' ) }
					</Button>
				</ButtonGroup>
			);

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
		if ( ! this.props.isBulkManagementActive ) {
			return null;
		}

		const isJetpackSelected = this.props.selected.some( plugin => 'jetpack' === plugin.slug ),
			needsRemoveButton = !! this.props.selected.length && this.canUpdatePlugins() && ! isJetpackSelected;

		return (
			<SelectDropdown compact
					className="plugin-list-header__actions_dropdown"
					key="plugin-list-header__actions_dropdown"
					selectedText={ this.translate( 'Actions' ) } >

				<DropdownItem key="plugin__actions_title" selected={ true } value="Actions">
					{ this.translate( 'Actions' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_1" />

				<DropdownItem key="plugin__actions_activate"
						disabled={ ! this.props.haveUpdatesSelected }
						onClick={ this.props.updateSelected }>
					{ this.translate( 'Update' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_1" />

				<DropdownItem key="plugin__actions_activate"
						disabled={ ! this.props.haveInactiveSelected }
						onClick={ this.props.activateSelected }>
					{ this.translate( 'Activate' ) }
				</DropdownItem>

				{ isJetpackSelected
					? <DropdownItem key="plugin__actions_disconnect"
							disabled={ ! this.props.haveActiveSelected }
							onClick={ this.props.deactiveAndDisconnectSelected }>
						{ this.translate( 'Disconnect' ) }
					</DropdownItem>
					: <DropdownItem key="plugin__actions_deactivate"
							disabled={ ! this.props.haveActiveSelected }
							onClick={ this.props.deactivateSelected }>
						{ this.translate( 'Deactivate' ) }
					</DropdownItem>
				}

				<DropdownSeparator key="plugin__actions_separator_2" />

				<DropdownItem key="plugin__actions_autoupdate"
						disabled={ ! this.canUpdatePlugins() }
						onClick={ this.props.setAutoupdateSelected }>
					{ this.translate( 'Autoupdate' ) }
				</DropdownItem>

				<DropdownItem key="plugin__actions_disable_autoupdate"
						disabled={ ! this.canUpdatePlugins() }
						onClick={ this.props.unsetAutoupdateSelected }>
					{ this.translate( 'Disable Autoupdates' ) }
				</DropdownItem>

				<DropdownSeparator key="plugin__actions_separator_3" />

				<DropdownItem key="plugin__actions_remove"
						className="plugin-list-header__actions_remove_item"
						disabled={ ! needsRemoveButton }
						onClick={ this.props.removePluginNotice } >
					{ this.translate( 'Remove' ) }
				</DropdownItem>
			</SelectDropdown>
		);
	},

	render() {
		const sectionClasses = classNames( 'plugin-list-header', { 'is-bulk-editing': this.props.isBulkManagementActive, 'is-action-bar-visible': this.state.actionBarVisible } );
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
				{ this.renderCurrentActionButtons() }
			</SectionHeader>
		);
	}
} );
