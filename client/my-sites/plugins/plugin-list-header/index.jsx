import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import BulkSelect from 'calypso/components/bulk-select';
import ButtonGroup from 'calypso/components/button-group';
import SectionHeader from 'calypso/components/section-header';
import SelectDropdown from 'calypso/components/select-dropdown';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import getSites from 'calypso/state/selectors/get-sites';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

// Constants help determine if the action bar should be a dropdown
const MAX_ACTIONBAR_HEIGHT = 57;
const MIN_ACTIONBAR_WIDTH = 600;

export class PluginsListHeader extends PureComponent {
	state = {
		actionBarVisible: true,
	};

	static defaultProps = {
		disabled: false,
	};

	static propTypes = {
		label: PropTypes.string,
		hasManagePluginsFeature: PropTypes.bool,
		isBulkManagementActive: PropTypes.bool,
		isWpComAtomic: PropTypes.bool,
		isWpcom: PropTypes.bool,
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
		activatePluginNotice: PropTypes.func.isRequired,
		deactivatePluginNotice: PropTypes.func.isRequired,
		autoupdateEnablePluginNotice: PropTypes.func.isRequired,
		autoupdateDisablePluginNotice: PropTypes.func.isRequired,
		updatePluginNotice: PropTypes.func.isRequired,
		updateAllPluginsNotice: PropTypes.func.isRequired,
		haveActiveSelected: PropTypes.bool,
		haveInactiveSelected: PropTypes.bool,
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
		return this.props.selected.some( ( plugin ) => 'jetpack' === plugin.slug );
	}

	canUpdatePlugins() {
		const { selected, allSites } = this.props;
		return selected.some( ( plugin ) =>
			Object.values( allSites )
				.filter( ( { ID } ) => plugin.sites.hasOwnProperty( ID ) )
				.some( ( site ) => site.canUpdateFiles )
		);
	}

	needsRemoveButton() {
		return this.props.selected.length && this.canUpdatePlugins();
	}

	hasSelectedPlugins() {
		return this.props.selected.length > 0;
	}

	renderCurrentActionButtons() {
		const { hasManagePluginsFeature, isWpcom, isWpComAtomic, translate, siteId } = this.props;
		const buttons = [];

		if ( siteId && isWpComAtomic && ! hasManagePluginsFeature ) {
			return buttons;
		}

		const isJetpackSelected = this.isJetpackSelected();
		const needsRemoveButton = this.needsRemoveButton();
		const rightSideButtons = [];
		const leftSideButtons = [];
		const autoupdateButtons = [];
		const activateButtons = [];

		if ( ! this.props.isBulkManagementActive ) {
			if ( 0 < this.props.pluginUpdateCount ) {
				rightSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-update-all">
						<Button compact primary onClick={ this.props.updateAllPluginsNotice }>
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
					<Button
						className="plugin-list-header__buttons-action-button"
						compact
						onClick={ this.toggleBulkManagement }
					>
						{ translate( 'Edit All', { context: 'button label' } ) }
					</Button>
				</ButtonGroup>
			);
		} else {
			const updateButton = (
				<Button
					key="plugin-list-header__buttons-update"
					className="plugin-list-header__buttons-action-button"
					compact
					disabled={ isWpcom ? ! this.props.haveUpdatesSelected : ! this.hasSelectedPlugins() }
					primary={ isWpcom }
					onClick={ this.props.updatePluginNotice }
				>
					{ ! isWpcom ? translate( 'Update Plugins' ) : translate( 'Update' ) }
				</Button>
			);

			if ( isWpcom ) {
				leftSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-update-button">
						{ updateButton }
					</ButtonGroup>
				);
			}

			activateButtons.push(
				<Button
					key="plugin-list-header__buttons-activate"
					className="plugin-list-header__buttons-action-button"
					disabled={ isWpcom ? ! this.props.haveInactiveSelected : ! this.hasSelectedPlugins() }
					onClick={ this.props.activatePluginNotice }
					compact
				>
					{ translate( 'Activate' ) }
				</Button>
			);

			activateButtons.push(
				<Button
					compact
					key="plugin-list-header__buttons-deactivate"
					className="plugin-list-header__buttons-action-button"
					disabled={ isWpcom ? ! this.props.haveActiveSelected : ! this.hasSelectedPlugins() }
					onClick={ this.props.deactivatePluginNotice }
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
					className="plugin-list-header__buttons-action-button"
					disabled={ isWpcom ? ! this.canUpdatePlugins() : ! this.hasSelectedPlugins() }
					compact
					onClick={ this.props.autoupdateEnablePluginNotice }
				>
					{ translate( 'Autoupdate' ) }
				</Button>
			);
			autoupdateButtons.push(
				<Button
					key="plugin-list-header__buttons-autoupdate-off"
					className="plugin-list-header__buttons-action-button"
					disabled={ isWpcom ? ! this.canUpdatePlugins() : ! this.hasSelectedPlugins() }
					compact
					onClick={ this.props.autoupdateDisablePluginNotice }
				>
					{ ! isWpcom ? translate( 'Disable' ) : translate( 'Disable Autoupdates' ) }
				</Button>
			);

			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-update-buttons">
					{ autoupdateButtons }
				</ButtonGroup>
			);

			if ( ! isWpcom ) {
				leftSideButtons.push(
					<ButtonGroup key="plugin-list-header__buttons-update-button">
						{ updateButton }
					</ButtonGroup>
				);
			}

			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-remove-button">
					<Button
						compact
						scary
						disabled={ isWpcom ? ! needsRemoveButton : ! this.hasSelectedPlugins() }
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
		const { translate, selected, isBulkManagementActive, isWpcom } = this.props;
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
					disabled={ isWpcom ? ! this.props.haveUpdatesSelected : ! this.hasSelectedPlugins() }
					onClick={ this.props.updatePluginNotice }
				>
					{ ! isWpcom ? translate( 'Update Plugins' ) : translate( 'Update' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ isWpcom ? ! this.props.haveInactiveSelected : ! this.hasSelectedPlugins() }
						onClick={ this.props.activatePluginNotice }
					>
						{ translate( 'Activate' ) }
					</SelectDropdown.Item>
				) }
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ isWpcom ? ! this.props.haveActiveSelected : ! this.hasSelectedPlugins() }
						onClick={ this.props.deactivatePluginNotice }
					>
						{ translate( 'Deactivate' ) }
					</SelectDropdown.Item>
				) }

				<SelectDropdown.Separator />

				<SelectDropdown.Item
					disabled={ isWpcom ? ! this.canUpdatePlugins() : ! this.hasSelectedPlugins() }
					onClick={ this.props.autoupdateEnablePluginNotice }
				>
					{ translate( 'Autoupdate' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Item
					disabled={ isWpcom ? ! this.canUpdatePlugins() : ! this.hasSelectedPlugins() }
					onClick={ this.props.autoupdateDisablePluginNotice }
				>
					{ ! isWpcom ? translate( 'Disable' ) : translate( 'Disable Autoupdates' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />
				<SelectDropdown.Item
					className="plugin-list-header__actions-remove-item"
					disabled={ isWpcom ? ! needsRemoveButton : ! this.hasSelectedPlugins() }
					onClick={ this.props.removePluginNotice }
				>
					{ translate( 'Remove' ) }
				</SelectDropdown.Item>
			</SelectDropdown>
		);
	}

	render() {
		const { label, selected, plugins, isBulkManagementActive, isWpcom, translate } = this.props;
		const sectionClasses = classNames( {
			'plugin-list-header': true,
			'plugin-list-header-new': ! isWpcom,
			'is-bulk-editing': isBulkManagementActive,
			'is-action-bar-visible': this.state.actionBarVisible,
		} );
		return (
			<SectionHeader label={ label } className={ sectionClasses }>
				{ isBulkManagementActive && (
					<div className="plugin-list-header__bulk-select-wrapper">
						<BulkSelect
							key="plugin-list-header__bulk-select"
							totalElements={ plugins.length }
							selectedElements={ selected.length }
							onToggle={ this.unselectOrSelectAll }
						/>
						{ ! isWpcom && (
							<div className="plugin-list-header__bulk-select-label">
								{ translate( '%(number)d {{span}}Selected{{/span}}', {
									args: {
										number: selected.length,
									},
									components: {
										span: <span />,
									},
								} ) }
							</div>
						) }
					</div>
				) }
				{ this.renderCurrentActionDropdown() }
				{ this.renderCurrentActionButtons() }
			</SectionHeader>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		allSites: getSites( state ),
		hasManagePluginsFeature: siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS ),
		isWpComAtomic: isSiteWpcomAtomic( state, siteId ),
	};
} )( localize( PluginsListHeader ) );
