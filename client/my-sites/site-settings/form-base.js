/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:my-sites:site-settings' ),
	omit = require( 'lodash/object/omit' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	analytics = require( 'analytics' );

module.exports = {

	componentWillMount: function() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
		if ( this.props.site.settings ) {
			this.setState( this.getSettingsFromSite() );
		}
	},

	componentDidMount: function() {
		this.updateJetpackSettings();
	},

	/**
	 * Jetpack sites have special needs. When we first load a jetpack site's settings page
	 * or when we switch to a different jetpack site, we may need to get information about
	 * a module or we may need to get ssh credentials. if these methods exist, call them.
	 */
	updateJetpackSettings: function( site ) {
		this.getModuleStatus && this.getModuleStatus( site );
		this.getSshSettings && this.getSshSettings( site );
	},

	componentWillReceiveProps: function( nextProps ) {

		if ( ! nextProps.site ) {
			return;
		}

		if ( this.props.site.ID !== nextProps.site.ID ) {
			this.updateJetpackSettings( nextProps.site );
		}

		if ( nextProps.site.settings ) {
			let newState = this.getSettingsFromSite( nextProps.site );
			//for dirtyFields, see lib/mixins/dirty-linked-state
			if ( this.state.dirtyFields ) {
				//If we have any fields that the user has updated,
				//do not wipe out those fields from the poll update.
				newState = omit( newState, this.state.dirtyFields );
			}
			return this.setState( newState );
		}

		/**
		 * resetState assumes a form takes all data from the settings endpoint,
		 * but that's not true for the jetpack components. We need to address
		 * the difference in how jetpack forms are handling data, but for now
		 * this check is necessary to run resetState for the non-jetpack forms
		 */
		if ( ! this.getModuleStatus && ! this.getSshSettings ) {
			this.resetState();
		}

		if ( nextProps.site.fetchingSettings ) {
			this.setState( { fetchingSettings: true } );
		}

	},

	recordClickEventAndStop: function( recordObject, clickEvent ) {
		this.recordEvent( recordObject );
		clickEvent.preventDefault();
	},

	recordEvent: function( eventAction ) {
		analytics.ga.recordEvent( 'Site Settings', eventAction );
	},

	/**
	 * Record an analytics event only once per mounted component instance
	 * @param  {string} key         - unique key to namespace the event
	 * @param  {string} eventAction - the description of the action to appear in analytics
	 */
	recordEventOnce: function( key, eventAction ) {
		var newSetting = {};
		if ( this.state[ 'recordEventOnce-' + key ] ) {
			return;
		}
		this.recordEvent( eventAction );
		newSetting[ 'recordEventOnce-' + key ] = true;
		this.setState( newSetting );
	},

	getInitialState: function() {
		return this.getSettingsFromSite();
	},

	handleRadio: function( event ) {
		var name = event.currentTarget.name,
			value = event.currentTarget.value,
			updateObj = {};

		updateObj[ name ] = value;
		this.setState( updateObj );

	},

	toggleJetpackModule: function( module ) {
		var event = this.props.site.isModuleActive( module ) ? 'deactivate' : 'activate';
		notices.clearNotices( 'notices' );
		this.setState( { togglingModule: true } );
		this.props.site.toggleModule( module, function( error ) {
				this.setState( { togglingModule: false } );
				if ( error ) {
					debug( 'jetpack module toggle error', error );
					this.handleError();
					this.props.site.handleError(
						error,
						this.props.site.isModuleActive( module ) ? 'deactivateModule' : 'activateModule',
						{},
						this.props.site.getModule( module )
					);
				} else {
					if( 'protect' === module ) {
						this.props.site.fetchSettings();
					}
					this.getModuleStatus();
				}
			}.bind( this )
		);

		this.recordEvent( "Clicked to " + event + " Jetpack " + module );
	},

	submitForm: function( event ) {
		var site = this.props.site;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		this.setState( { submittingForm: true } );

		site.saveSettings( omit( this.state, 'dirtyFields' ), function( error ) {
			if ( error ) {
				// handle error case here
				switch ( error.error ) {
					case 'invalid_ip':
						notices.error( this.translate( 'One of your IP Addresses was invalid. Please, try again.' ) );
						break;
					default:
						notices.error( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
				}
				this.setState( { submittingForm: false } );
			} else {
				notices.success( this.translate( 'Settings saved successfully!' ) );
				this.markSaved();
				//for dirtyFields, see lib/mixins/dirty-linked-state
				this.setState( { submittingForm: false, dirtyFields: [] } );

				site.fetchSettings();
			}
		}.bind( this ) );

		this.recordEvent( 'Clicked Save Settings Button' );
	}

};
