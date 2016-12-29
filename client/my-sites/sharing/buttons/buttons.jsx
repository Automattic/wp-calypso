/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/assign' ),
	async = require( 'async' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	ButtonsAppearance = require( './appearance' ),
	ButtonsOptions = require( './options' ),
	notices = require( 'notices' ),
	analytics = require( 'lib/analytics' );
import { protectForm } from 'lib/protect-form';

module.exports = protectForm( React.createClass( {
	displayName: 'SharingButtons',

	mixins: [
		observe( 'site', 'buttons', 'postTypes' )
	],

	propTypes: {
		site: React.PropTypes.object.isRequired,
		buttons: React.PropTypes.object.isRequired,
		postTypes: React.PropTypes.object.isRequired,
		markSaved: React.PropTypes.func.isRequired,
		markChanged: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			values: {},
			isSaving: false,
			buttonsPendingSave: null
		};
	},

	saveChanges: function( event ) {
		var tasks = [
			this.props.site.saveSettings.bind( this.props.site, this.state.values )
		];

		if ( this.state.buttonsPendingSave ) {
			tasks.push(
				this.props.buttons.saveAll.bind( this.props.buttons, this.props.site.ID, this.state.buttonsPendingSave )
			);
		}

		async.parallel( tasks, this.onSaveComplete );

		this.setState( {
			isSaving: true
		} );

		analytics.ga.recordEvent( 'Sharing', 'Clicked Save Changes Button' );

		event.preventDefault();
	},

	onSaveComplete: function( error ) {
		if ( error ) {
			notices.error( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
		} else {
			notices.success( this.translate( 'Settings saved successfully!' ) );
		}

		this.props.markSaved();
		this.setState( {
			values: {},
			isSaving: false,
			buttonsPendingSave: null
		} );
	},

	handleChange: function( option, value ) {
		var pairs;

		if ( undefined === value ) {
			pairs = option;
		} else {
			pairs = {};
			pairs[ option ] = value;
		}

		this.props.markChanged();
		this.setState( {
			values: assign( {}, this.state.values, pairs )
		} );
	},

	handleButtonsChange: function( buttons ) {
		this.props.markChanged();
		this.setState( { buttonsPendingSave: buttons } );
	},

	getPreviewButtons: function() {
		return this.state.buttonsPendingSave || this.props.buttons.get( this.props.site.ID );
	},

	isInitialized: function( sources ) {
		return sources.every( function( source ) {
			if ( 'settings' === source ) {
				return this.props.site.settings;
			} else {
				return this.props[ source ].hasDataForSiteId( this.props.site.ID );
			}
		}, this );
	},

	render: function() {
		var settings = assign( {}, this.props.site.settings, this.state.values );

		return (
			<form onSubmit={ this.saveChanges } id="sharing-buttons" className="sharing-settings sharing-buttons">
				<ButtonsAppearance
					buttons={ this.getPreviewButtons() }
					values={ settings }
					onChange={ this.handleChange }
					onButtonsChange={ this.handleButtonsChange }
					initialized={ this.isInitialized( [ 'settings', 'buttons' ] ) }
					saving={ this.state.isSaving } />
				<ButtonsOptions
					site={ this.props.site }
					postTypes={ this.props.postTypes.get( this.props.site.ID ) }
					buttons={ this.props.buttons.get( this.props.site.ID ) }
					values={ settings }
					onChange={ this.handleChange }
					initialized={ this.isInitialized( [ 'settings', 'postTypes' ] ) }
					saving={ this.state.isSaving } />
			</form>
		);
	}
} ) );
