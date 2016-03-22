/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Site from 'my-sites/site';
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import layoutFocus from 'lib/layout-focus';
import * as PreviewActions from 'state/preview/actions';
import designToolsById from './design-tools';
import accept from 'lib/accept';

const debug = debugFactory( 'calypso:design-menu' );

const DesignMenu = React.createClass( {

	propTypes: {
		state: React.PropTypes.object.isRequired,
		isSaved: React.PropTypes.bool,
		customizations: React.PropTypes.object,
		selectedSite: React.PropTypes.object.isRequired,
		actions: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
			isSaved: true,
			customizations: {},
		};
	},

	getInitialState() {
		return {
			activeControl: null,
		};
	},

	componentWillMount() {
		// Clear the customizations when we first load
		this.props.actions.clearCustomizations();
		// Fetch the preview
		this.props.actions.fetchPreviewMarkup( this.props.selectedSite.ID, '' );
	},

	enterControl( id ) {
		this.setState( { activeControl: id } );
	},

	enterDefaultControl() {
		this.enterControl( null );
	},

	onSave() {
		this.props.actions.saveCustomizations();
	},

	onBack() {
		if ( this.state.activeControl ) {
			const activeControl = designToolsById[ this.state.activeControl ];
			if ( activeControl && activeControl.parentId ) {
				return this.enterControl( this.state.activeControl );
			}
			return this.enterDefaultControl();
		}
		if ( ! this.props.isSaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.actions.clearCustomizations();
					layoutFocus.set( 'sidebar' );
				}
			} );
		}
		this.props.actions.clearCustomizations();
		layoutFocus.set( 'sidebar' );
	},

	renderDesignTool( id, componentClass, props = {} ) {
		debug( 'rendering design tool', id );
		return React.createElement( componentClass, assign( props, {
			activateControl: this.enterControl,
			onChange: this.buildOnChangeFor( id ),
		} ) );
	},

	buildOnChangeFor( id ) {
		return customizations => {
			debug( 'changing customizations for', id, customizations );
			const newCustomizations = assign( {}, this.props.customizations, { [ id ]: assign( {}, this.props.customizations[ id ], customizations ) } );
			debug( 'changed customizations to', newCustomizations );
			return this.props.actions.updateCustomizations( newCustomizations );
		}
	},

	getPropsForDesignTool( config ) {
		if ( config.mapStateToProps ) {
			return config.mapStateToProps( this.props.state );
		}
		return {};
	},

	renderDesignTools() {
		if ( this.state.activeControl ) {
			const config = designToolsById[ this.state.activeControl ];
			if ( config ) {
				// allow each design tool to configure its own state
				return this.renderDesignTool( this.state.activeControl, config.componentClass, this.getPropsForDesignTool( config ) );
			}
		}
		if ( ! designToolsById.default ) {
			throw new Error( 'No default design tool found.' );
		}
		const controls = this.getTopLevelDesignTools() || [];
		return this.renderDesignTool( 'default', designToolsById.default.componentClass, { controls } );
	},

	getTopLevelDesignTools() {
		return Object.keys( designToolsById )
		.filter( id => ! designToolsById[ id ].parentId )
		.filter( id => id !== 'default' )
		.map( id => ( { id, title: designToolsById[ id ].title } ) );
	},

	render() {
		// The site object required by Site isn't quite the same as the one in the
		// Redux store, so we patch it.
		const site = assign( {}, this.props.selectedSite, {
			title: this.props.selectedSite.name,
			domain: this.props.selectedSite.URL.replace( /^https?:\/\//, '' ),
		} );
		const saveButtonText = this.props.isSaved ? this.translate( 'Saved' ) : this.translate( 'Publish Changes' );
		return (
			<div className="design-menu">
				<span className="current-site__switch-sites">
					<Button compact borderless onClick={ this.onBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.translate( 'Back' ) }
					</Button>
					<Site site={ site } />
					<Card className="design-menu__header-buttons">
						<Button primary compact disabled={ this.props.isSaved } className="design-menu__save" onClick={ this.onSave } >{ saveButtonText }</Button>
					</Card>
				</span>
				{ this.renderDesignTools() }
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	const siteId = state.ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	if ( ! state.preview ) {
		return { state, selectedSite };
	}
	return { state, selectedSite, customizations: state.preview.customizations, isSaved: state.preview.isSaved };
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( PreviewActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignMenu );
