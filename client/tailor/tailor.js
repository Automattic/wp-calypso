/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import find from 'lodash/find';
import assign from 'lodash/assign';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import * as TailorActions from './actions';
import WebPreview from 'components/web-preview';
import TailorControls from './tailor-controls';
import controlConfig from './controls/config';

const debug = debugFactory( 'calypso:tailor' );

const LoadingPanel = props => <div className="tailor__loading"><h1>{ props.translate( 'Loading' ) }</h1></div>;

const Tailor = React.createClass( {
	propTypes: {
		actions: React.PropTypes.object.isRequired,
		blogname: React.PropTypes.string.isRequired,
		// The current preview HTML markup
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object.isRequired,
		site: React.PropTypes.object.isRequired,
		state: React.PropTypes.object.isRequired,
		activeControl: React.PropTypes.string,
		controlConfig: React.PropTypes.array.isRequired,
	},

	getInitialState() {
		return {
			previewDoc: null,
			isUnsaved: false,
		};
	},

	componentWillMount() {
		this.validateControls();
		// Clear the customizations when we first load
		this.props.actions.clearCustomizations();
		// Fetch the preview
		this.props.actions.fetchPreviewMarkup( this.props.sites.selected, '' );
		// Fetch the customizations for each control
		this.fetchInitialCustomizations();
	},

	validateControls() {
		if ( ! this.props.controlConfig.every( this.validateControl ) ) {
			throw new Error( 'Controls include invalid data' );
		}
		debug( 'controls are valid' );
	},

	validateControl( control ) {
		return ( control.id && control.title && control.componentClass && control.setupFunction && control.saveFunction && control.updatePreviewFunction );
	},

	fetchInitialCustomizations() {
		this.props.controlConfig.map( this.fetchCustomizationsFor );
	},

	fetchCustomizationsFor( config ) {
		debug( 'fetching customizations for', config.id );
		config.setupFunction( this.props.actions, this.props.state, this.props.site.ID )
		.then( this.generateUpdaterForComponent( config ) );
	},

	updatePreviewFor( config, customizations ) {
		if ( ! this.state.previewDoc ) {
			debug( 'not updating preview; it does not appear to be loaded' );
			return;
		}
		debug( 'updating preview to match customizations for', config.id );
		config.updatePreviewFunction( this.state.previewDoc, customizations );
	},

	getMarkup() {
		return this.props.previewMarkup;
	},

	getControlById( id ) {
		return find( this.props.controlConfig, { id } );
	},

	prepareControlForRender( control ) {
		if ( control ) {
			return { id: control.id, title: control.title, component: this.buildControl( control ) };
		}
	},

	updateCustomizations( customizations ) {
		this.props.actions.updateCustomizations( customizations );
		this.setState( { isUnsaved: true } );
	},

	updateCustomizationsFor( config, customizations ) {
		debug( 'updating customizations for', config.id, customizations );
		this.updateCustomizations( assign( {}, this.props.customizations, { [ config.id ]: assign( this.props.customizations[ config.id ], customizations ) } ) );
		this.updatePreviewFor( config, customizations );
	},

	generateUpdaterForComponent( config ) {
		return customizations => this.updateCustomizationsFor( config, customizations );
	},

	buildControl( config ) {
		const { id, componentClass } = config;
		const props = {
			site: this.props.site,
			onChange: this.generateUpdaterForComponent( config ),
			activateControl: this.activateControl,
		};
		return React.createElement( componentClass, assign( props, this.getCustomizationsForComponent( id ) ) );
	},

	getCustomizationsForComponent( id ) {
		return this.props.customizations[ id ] || {};
	},

	getTopLevelControls() {
		return this.props.controlConfig
		.filter( config => ! config.parentId )
		.map( config => ( { id: config.id, title: config.title } ) );
	},

	activateControl( id ) {
		this.props.actions.enterControl( id );
	},

	onClose() {
		if ( this.state.isUnsaved ) {
			//TODO: show warning
		}
		this.props.actions.clearCustomizations();
		const path = this.props.prevPath || '/tailor';
		debug( 'exiting customizer and routing to', path );
		page.back( path );
	},

	onClickBack() {
		if ( this.props.activeControl ) {
			const control = this.getControlById( this.props.activeControl );
			if ( control && control.parentId ) {
				return this.props.actions.enterControl( control.parentId );
			}
		}
		this.props.actions.leaveControl();
	},

	saveCustomizationsFor( config, customizations ) {
		debug( 'saving customizations for', config.id );
		config.saveFunction( this.props.actions, customizations, this.props.site.ID );
	},

	onSave() {
		this.props.controlConfig.map( config => this.saveCustomizationsFor( config, this.props.customizations[ config.id ] ) );
		this.setState( { isUnsaved: false } );
	},

	onPreviewLoad( previewDoc ) {
		this.setState( { previewDoc } );
	},

	render() {
		if ( ! this.props.previewMarkup ) {
			debug( 'rendering tailor loading screen' );
			return (
				<div className="tailor">
					<LoadingPanel translate={ this.translate } />
				</div>
			);
		}
		const showingControl = this.props.activeControl ? this.prepareControlForRender( this.getControlById( this.props.activeControl ) ) : null;
		debug( 'rendering tailor control screen with control', showingControl );
		return (
			<div className="tailor">
				<TailorControls
					siteTitle={ this.props.blogname }
					controls={ this.getTopLevelControls() }
					activateControl={ this.activateControl }
					showingControl={ showingControl }
					isUnsaved={ this.state.isUnsaved }
					onClose={ this.onClose }
					onClickBack={ this.onClickBack }
					onSave={ this.onSave }
				/>
				<WebPreview
					showExternal={ false }
					previewMarkup={ this.getMarkup() }
					onLoad={ this.onPreviewLoad }
					showPreview
				/>
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	const { tailor, ui } = state;
	if ( ! tailor.customizations ) {
		tailor.customizations = {};
	}
	debug( 'current customizations', tailor.customizations );
	const siteId = ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	const blogname = get( tailor.customizations, 'siteTitle.blogname' ) || selectedSite.title;
	return {
		previewMarkup: tailor.previewMarkup,
		customizations: tailor.customizations,
		activeControl: tailor.activeControl,
		blogname,
		site: selectedSite,
		state,
		controlConfig,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( TailorActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( Tailor );
