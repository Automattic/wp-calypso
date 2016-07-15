/**
 * External dependencies
 */
import debugFactory from 'debug';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import notices from 'notices';
import analytics from 'lib/analytics';

const debug = debugFactory( 'calypso:my-sites:site-settings' );

module.exports = {

	componentWillMount() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
		if ( this.props.site.settings ) {
			this.setState( this.getSettingsFromSite() );
		}
	},

	componentDidMount() {
		this.updateJetpackSettings();
	},

	/**
	 * Jetpack sites have special needs. When we first load a jetpack site's settings page
	 * or when we switch to a different jetpack site, we may need to get information about
	 * a module or we may need to get ssh credentials. if these methods exist, call them.
	 *
	 * @param {String|Number} site - site identification
	 */
	updateJetpackSettings( site ) {
		this.getModuleStatus && this.getModuleStatus( site );
		this.getSshSettings && this.getSshSettings( site );
	},

	componentWillReceiveProps( nextProps ) {
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

	recordClickEventAndStop( recordObject, clickEvent ) {
		this.recordEvent( recordObject );
		clickEvent.preventDefault();
	},

	recordEvent( eventAction ) {
		debug( 'record event: %o', eventAction );
		analytics.ga.recordEvent( 'Site Settings', eventAction );
	},

	/**
	 * Record an analytics event only once per mounted component instance
	 * @param  {string} key         - unique key to namespace the event
	 * @param  {string} eventAction - the description of the action to appear in analytics
	 */
	recordEventOnce( key, eventAction ) {
		debug( 'record event once: %o - %o', key, eventAction );
		if ( this.state[ 'recordEventOnce-' + key ] ) {
			return;
		}
		this.recordEvent( eventAction );
		this.setState( { [ 'recordEventOnce-' + key ]: true } );
	},

	getInitialState() {
		return this.getSettingsFromSite();
	},

	handleRadio( event ) {
		const currentTargetName = event.currentTarget.name,
			currentTargetValue = event.currentTarget.value;

		this.setState( { [ currentTargetName ]: currentTargetValue } );
	},

	toggleJetpackModule( module ) {
		const event = this.props.site.isModuleActive( module ) ? 'deactivate' : 'activate';
		notices.clearNotices( 'notices' );
		this.setState( { togglingModule: true } );
		this.props.site.toggleModule( module, error => {
			this.setState( { togglingModule: false } );
			if ( error ) {
				debug( 'jetpack module toggle error', error );
				this.handleError();
				this.props.site.handleError(
					error,
					this.props.site.isModuleActive( module ) ? 'deactivateModule' : 'activateModule',
					{},
					module
				);
			} else {
				if ( 'protect' === module ) {
					this.props.site.fetchSettings();
				}
				this.getModuleStatus();
			}
		} );

		this.recordEvent( `Clicked to ${event} Jetpack ${module}` );
	},

	submitForm( event ) {
		const { site } = this.props;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		this.setState( { submittingForm: true } );

		site.saveSettings( omit( this.state, 'dirtyFields' ), error => {
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
				notices.success( this.translate( 'Settings saved!' ) );
				this.markSaved();
				//for dirtyFields, see lib/mixins/dirty-linked-state
				this.setState( { submittingForm: false, dirtyFields: [] } );

				site.fetchSettings();
			}

			if ( 'function' === typeof this.onSaveComplete ) {
				this.onSaveComplete( error );
			}
		} );

		this.recordEvent( 'Clicked Save Settings Button' );
	}
};
