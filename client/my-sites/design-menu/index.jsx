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
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import * as DesignMenuActions from 'my-sites/design-menu/actions';
import designToolsById from './design-tools';
import accept from 'lib/accept';

const debug = debugFactory( 'calypso:design-menu' );

const DesignMenu = React.createClass( {

	propTypes: {
		isSaved: React.PropTypes.bool,
		customizations: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired,
		actions: React.PropTypes.object.isRequired,
	},

	componentWillMount() {
		// Clear the customizations when we first load
		this.props.actions.clearCustomizations();
		// Fetch the preview
		this.props.actions.fetchPreviewMarkup( this.props.selectedSite.ID, '' );
	},

	onBack() {
		if ( this.props.activeControl ) {
			const activeControl = designToolsById[ this.props.activeControl ];
			if ( activeControl && activeControl.parentId ) {
				return this.props.actions.enterControl( this.props.activeControl );
			}
			return this.props.actions.leaveControl();
		}
		if ( ! this.props.isSaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.actions.closeDesignMenu();
				}
			} );
		}
		this.props.actions.closeDesignMenu();
	},

	renderDesignTool( id, componentClass, props = {} ) {
		debug( 'rendering design tool', id );
		return React.createElement( componentClass, assign( props, {
			activateControl: this.props.actions.enterControl,
			// only pass the customizations for this design tool
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

	renderDesignTools() {
		if ( this.props.activeControl ) {
			const config = designToolsById[ this.props.activeControl ];
			if ( config ) {
				return this.renderDesignTool( this.props.activeControl, config.componentClass );
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
		return (
			<div className="design-menu">
				<div className="design-menu__sidebar-actions">
					<Button compact borderless onClick={ this.onBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.translate( 'Back' ) }
					</Button>
					<Button compact borderless href="/design">
						{ this.translate( 'Themes' ) } <Gridicon icon="themes" size={ 18 } />
					</Button>
				</div>
				{ this.renderDesignTools() }
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	const { ui, tailor } = state;
	const siteId = ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	return { selectedSite, activeControl: tailor.activeControl, customizations: tailor.customizations, isSaved: tailor.isSaved };
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( DesignMenuActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignMenu );
