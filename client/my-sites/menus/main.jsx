/**
 * External dependencies
 */
var React = require( 'react' ),
	find = require( 'lodash/find' ),
	debug = require( 'debug' )( 'calypso:menus:index' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var protectForm = require( 'lib/mixins/protect-form' ),
	observe = require( 'lib/mixins/data-observe' ),
	notices = require( 'notices' ),
	LocationPicker = require( './location-picker' ),
	MenuPicker = require( './menu-picker' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	Main = require( 'components/main' ),
	Menu = require( './menu' ),
	MenuSaveButton = require( './menus-save-button' ),
	EmptyContent = require( 'components/empty-content' ),
	LoadingPlaceholder = require( './loading-placeholder' ),
	analytics = require( 'lib/analytics' ),
	EmailVerificationGate = require( 'components/email-verification/email-verification-gate' ),
	JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );

var Menus = React.createClass( {

	mixins: [ protectForm.mixin, observe( 'site', 'siteMenus', 'itemTypes' ) ],

	componentWillMount: function() {
		this.props.siteMenus.on( 'change', this.maybeMarkChanged );
		this.props.siteMenus.on( 'saved', this.markSaved );
		this.props.siteMenus.on( 'error', this.displayError );
		window.addEventListener( 'unload', this.recordUnloadEvent );
		this.props.itemTypes.get();
	},

	componentWillUnmount: function() {
		if ( this.props.siteMenus.get().hasChanged ) {
			analytics.ga.recordEvent( 'Menus', 'Navigate Away with Unsaved Changes' );
		}
		this.props.siteMenus.off( 'change', this.maybeMarkChanged );
		this.props.siteMenus.off( 'saved', this.markSaved );
		this.props.siteMenus.off( 'error', this.displayError );
		window.removeEventListener( 'unload', this.recordUnloadEvent );
	},

	getInitialState: function() {
		return {
			selectedLocation: null,
			isBusy: false
		};
	},

	maybeMarkChanged: function() {
		if ( this.props.siteMenus.get().hasChanged ) {
			this.markChanged();
		}
	},

	displayError: function( error ) {
		notices.error( error );
	},

	/**
	 * Request confirmation from user to proceed with action that will cause changes to be lost.
	 *
	 * @param {string} switchAction: 'menu' | 'location'
	 * @return {bool} true to proceed and lose unsaved changes
	 */
	confirmDiscard: function( switchAction ) {
		var data = this.props.siteMenus.get(),
			menu = this.getSelectedMenu(),
			associationChanged = this.props.siteMenus.get().hasAssociationChanged,
			location, leaveText, result, gaEvent;

		gaEvent = {
			menu: 'Switch Menu with Unsaved Changes',
			location: 'Switch Menu Area with Unsaved Changes'
		};

		if ( associationChanged ) {
			location = find( data.locations, { name: this.getSelectedLocation() } );
		}

		leaveText = this.getConfirmationString( switchAction, associationChanged, menu, location );

		result = window.confirm( leaveText ); // eslint-disable-line no-alert
		if ( result ) {
			analytics.ga.recordEvent( 'Menus', gaEvent[ switchAction ] );
		}
		return result;
	},

	getConfirmationString: function( switchAction, associationChanged, menu, location ) {
		var i18nStrings = {
			menuChanged: {
				menu: this.translate(
					'You have unsaved menu changes. Switching to a different menu will discard your changes. Continue?',
					{ textOnly: true }
				),
				location: this.translate(
					'You have unsaved menu changes. Switching to a different menu area will discard your changes. Continue?',
					{ textOnly: true }
				)
			},
			associationChanged: {
				menu: function( mainMenu, mainLocation ) {
					return this.translate(
						'You have selected menu "%(menu)s" for area "%(location)s", but you have not manually saved this change. Switching to a different menu area will discard your changes. Continue?',
						{
							args: {
								menu: mainMenu.name,
								location: mainLocation.description
							},
							textOnly: true
						}
					);
				}.bind( this ),
				noMenu: function( mainLocation ) {
					return this.translate(
						'You have removed the menu from area "%s", but you have not manually saved this change. Switching to a different menu area will discard your changes. Continue?',
						{
							args: [ mainLocation.description ],
							textOnly: true
						}
					);
				}.bind( this )
			}
		};

		if ( associationChanged ) {
			return menu
				? i18nStrings.associationChanged.menu( menu, location )
				: i18nStrings.associationChanged.noMenu( location );
		}

		return i18nStrings.menuChanged[ switchAction ];
	},

	recordUnloadEvent: function() {
		if ( this.props.siteMenus.get().hasChanged ) {
			analytics.ga.recordEvent( 'Menus', 'Navigate Away with Unsaved Changes' );
		}
	},

	selectLocation: function( locationName ) {
		if ( this.props.siteMenus.get().hasChanged ) {
			if ( ! this.confirmDiscard( 'location' ) ) {
				return;
			}
			this.props.siteMenus.discard();
		}
		this.setState( { selectedLocation: locationName } );
	},

	getSelectedLocation: function() {
		return this.state.selectedLocation || this.props.siteMenus.getPrimaryLocation();
	},

	getSelectedMenu: function() {
		var defaultMenuId = this.props.siteMenus.getDefaultMenuId(),
			selectedMenu = this.props.siteMenus.getMenu( this.getSelectedLocation() ),
			isDefaultMenu = selectedMenu && selectedMenu.id === defaultMenuId;

		if ( isDefaultMenu || ! selectedMenu ) {
			return this.isPrimaryLocationSelected() ? this.getDefaultMenu() : null;
		}

		return selectedMenu;
	},

	getDefaultMenu: function() {
		return this.props.siteMenus.getDefaultMenu();
	},

	isPrimaryLocationSelected: function() {
		return this.getSelectedLocation() === this.props.siteMenus.getPrimaryLocation();
	},

	setBusy: function( busy ) {
		this.setState( { isBusy: busy } );
	},

	renderEmptyContent: function() {
		var title;
		var illustration = '/calypso/images/drake/drake-nomenus.svg';

		if ( this.isPrimaryLocationSelected() ) {
			title = this.translate( 'Theme Default Menu' );
		} else {
			title = this.translate( 'No Menu Selected' );
		}

		return (
			<div>
				<div className="menus__menu-header">
					<div className="menus__menu-actions">
						<MenuSaveButton menuData={ this.props.siteMenus } />
					</div>
				</div>

				<EmptyContent title={ title } illustration={ illustration } />

			</div>
		);
	},

	renderJetpackManageDisabledMessage: function( site ) {
		const data = this.props.siteMenus.get();
		let featureExample;

		if ( data.menus && data.locations &&
			data.hasDefaultMenu && this.props.itemTypes.fetched ) {
			featureExample = this.renderMenus();
		}

		return (
			<Main className="manage-menus">
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.translate( 'Looking to manage this site\'s menus?' ) }
					site={ site }
					section="menus"
					secondaryAction={ this.translate( 'Open Classic Menu Editor' ) }
					secondaryActionURL={ site.options.admin_url + 'nav-menus.php' }
					secondaryActionTarget="_blank"
					featureExample={ featureExample }
				/>
			</Main>
		);
	},

	renderMenus: function() {
		var selectedLocation = this.getSelectedLocation(),
			selectedMenu = this.getSelectedMenu(),
			data = this.props.siteMenus.get(),
			menu;

		if ( ! data.menus || ! data.locations || ! data.hasDefaultMenu ||
			! this.props.itemTypes.fetched || this.state.isBusy ) {
			return <LoadingPlaceholder />;
		}

		if ( selectedMenu ) {
			// Menu components should not persist beyond save, since item ids
			// are reallocated on every save
			menu = <Menu key={ selectedMenu.id + ' ' + ( selectedMenu.lastSaveTime || 0 ) }
						selectedMenu={ selectedMenu }
						selectedLocation={ selectedLocation }
						siteMenus={ this.props.siteMenus }
						setBusy={ this.setBusy }
						confirmDiscard={ this.confirmDiscard.bind( null, 'menu' ) } />;
		}

		return (
			<div>
				<div className="menus__pickers">
					<LocationPicker
						locations={ data.locations }
						selectedLocation={ selectedLocation }
						selectHandler={ this.selectLocation } />
					<p className="menus__pickers-conjunction">{ this.translate( 'uses' ) }</p>
					<MenuPicker
						menuData={ this.props.siteMenus }
						menus={ data.menus }
						selectedMenu={ selectedMenu }
						selectedLocation={ selectedLocation }
						isPrimaryLocation={ this.isPrimaryLocationSelected() }
						confirmDiscard={ this.confirmDiscard.bind( null, 'menu' ) } />
				</div>
				{ selectedMenu ? menu : this.renderEmptyContent() }
			</div>
		);
	},

	render: function() {
		var site = this.props.site;
		if ( site && site.jetpack && ! site.canManage() ) {
			return this.renderJetpackManageDisabledMessage( site );
		}

		return (
			<Main className="manage-menus">
				<SidebarNavigation />
				<EmailVerificationGate>
					{ this.renderMenus() }
				</EmailVerificationGate>
			</Main>
		);
	}
} );

module.exports = Menus;
