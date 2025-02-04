import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Button, Gridicon, SelectDropdown } from '@automattic/components';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import BulkSelect from 'calypso/components/bulk-select';
import ButtonGroup from 'calypso/components/button-group';
import SectionHeader from 'calypso/components/section-header';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import getSites from 'calypso/state/selectors/get-sites';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UpdatePlugins from '../plugin-management-v2/update-plugins';

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
		toggleBulkManagement: PropTypes.func.isRequired,
		updateSelected: PropTypes.func.isRequired,
		deactiveAndDisconnectSelected: PropTypes.func.isRequired,
		setAutoupdateSelected: PropTypes.func.isRequired,
		setSelectionState: PropTypes.func.isRequired,
		unsetAutoupdateSelected: PropTypes.func.isRequired,
		removePluginNotice: PropTypes.func.isRequired,
		activatePluginNotice: PropTypes.func.isRequired,
		deactivatePluginNotice: PropTypes.func.isRequired,
		autoupdateEnablePluginNotice: PropTypes.func.isRequired,
		autoupdateDisablePluginNotice: PropTypes.func.isRequired,
		updatePluginNotice: PropTypes.func.isRequired,
		plugins: PropTypes.array.isRequired,
		selected: PropTypes.array.isRequired,
		isJetpackCloud: PropTypes.bool,
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

	hasSelectedPlugins() {
		return this.props.selected.length > 0;
	}

	renderCurrentActionButtons() {
		const {
			hasManagePluginsFeature,
			isWpComAtomic,
			siteId,
			isJetpackCloud,
			isBulkManagementActive,
			plugins,
		} = this.props;
		const buttons = [];

		if ( siteId && isWpComAtomic && ! hasManagePluginsFeature ) {
			return buttons;
		}

		const isJetpackSelected = this.isJetpackSelected();
		const rightSideButtons = [];
		const leftSideButtons = [];
		const autoupdateButtons = [];
		const activateButtons = [];
		if ( ! isBulkManagementActive ) {
			if ( isJetpackCloud ) {
				const updateButton = (
					<UpdatePlugins key="plugin-list-header__buttons-update-all" plugins={ plugins } />
				);
				if ( updateButton ) {
					rightSideButtons.push( updateButton );
				}
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
					disabled={ ! this.hasSelectedPlugins() }
					onClick={ this.props.updatePluginNotice }
					id="plugin-list-header__buttons-update-button"
				>
					{ translate( 'Update Plugins' ) }
				</Button>
			);

			activateButtons.push(
				<Button
					key="plugin-list-header__buttons-activate"
					className="plugin-list-header__buttons-action-button"
					disabled={ ! this.hasSelectedPlugins() }
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
					disabled={ ! this.hasSelectedPlugins() }
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
					disabled={ ! this.hasSelectedPlugins() }
					compact
					onClick={ this.props.autoupdateEnablePluginNotice }
					id="plugin-list-header__buttons-autoupdate-button"
				>
					{ translate( 'Autoupdate' ) }
				</Button>
			);
			autoupdateButtons.push(
				<Button
					key="plugin-list-header__buttons-autoupdate-off"
					className="plugin-list-header__buttons-action-button"
					disabled={ ! this.hasSelectedPlugins() }
					compact
					onClick={ this.props.autoupdateDisablePluginNotice }
				>
					{ translate( 'Disable' ) }
				</Button>
			);

			leftSideButtons.push(
				<ButtonGroup key="plugin-list-header__buttons-update-buttons">
					{ autoupdateButtons }
				</ButtonGroup>
			);

			leftSideButtons.push(
				<ButtonGroup
					key="plugin-list-header__buttons-update-button"
					className="plugin-management-v2__table-button-group"
				>
					{ updateButton }
				</ButtonGroup>
			);

			leftSideButtons.push(
				<ButtonGroup
					key="plugin-list-header__buttons-remove-button"
					className="plugin-management-v2__table-button-group"
				>
					<Button
						compact
						scary
						disabled={ ! this.hasSelectedPlugins() }
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
		const { selected, isBulkManagementActive } = this.props;
		if ( ! isBulkManagementActive ) {
			return null;
		}

		const isJetpackSelected = this.isJetpackSelected();

		const isJetpackOnlySelected = ! ( isJetpackSelected && selected.length === 1 );
		return (
			<SelectDropdown
				compact
				className="plugin-list-header__actions-dropdown"
				selectedText={ translate( 'Actions' ) }
			>
				<SelectDropdown.Separator />

				<SelectDropdown.Item
					disabled={ ! this.hasSelectedPlugins() }
					onClick={ this.props.updatePluginNotice }
				>
					{ translate( 'Update Plugins' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ ! this.hasSelectedPlugins() }
						onClick={ this.props.activatePluginNotice }
					>
						{ translate( 'Activate' ) }
					</SelectDropdown.Item>
				) }
				{ isJetpackOnlySelected && (
					<SelectDropdown.Item
						disabled={ ! this.hasSelectedPlugins() }
						onClick={ this.props.deactivatePluginNotice }
					>
						{ translate( 'Deactivate' ) }
					</SelectDropdown.Item>
				) }

				<SelectDropdown.Separator />

				<SelectDropdown.Item
					disabled={ ! this.hasSelectedPlugins() }
					onClick={ this.props.autoupdateEnablePluginNotice }
				>
					{ translate( 'Autoupdate' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Item
					disabled={ ! this.hasSelectedPlugins() }
					onClick={ this.props.autoupdateDisablePluginNotice }
				>
					{ translate( 'Disable' ) }
				</SelectDropdown.Item>

				<SelectDropdown.Separator />
				<SelectDropdown.Item
					className="plugin-list-header__actions-remove-item"
					disabled={ ! this.hasSelectedPlugins() }
					onClick={ this.props.removePluginNotice }
				>
					{ translate( 'Remove' ) }
				</SelectDropdown.Item>
			</SelectDropdown>
		);
	}

	render() {
		const { label, selected, plugins, isBulkManagementActive } = this.props;
		const sectionClasses = clsx( 'plugin-list-header plugin-list-header-new', {
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
