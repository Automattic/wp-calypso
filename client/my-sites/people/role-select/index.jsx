/**
 * External dependencies
 */
var React = require( 'react' ),
	debugFactory = require( 'debug' ),
	omit = require( 'lodash/object/omit' ),
	titleCase = require( 'to-title-case' );

var RolesStore = require( 'lib/site-roles/store' ),
	RolesActions = require( 'lib/site-roles/actions' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSelect = require( 'components/forms/form-select' );

var debug = debugFactory( 'calypso:role-select' );

/**
 * Internal dependencies
 */
module.exports = React.createClass( {
	displayName: 'RoleSelect',

	getInitialState: function() {
		return ( {
			roles: this.props.siteId ? RolesStore.getRoles( this.props.siteId ) : {}
		} );
	},

	componentDidMount: function() {
		RolesStore.on( 'change', this.refreshRoles );
		this.fetchRoles();
	},

	componentWillUnmount: function() {
		RolesStore.removeListener( 'change', this.refreshRoles );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.refreshRoles( nextProps );
	},

	refreshRoles: function( nextProps ) {
		var siteId = nextProps && nextProps.siteId ? nextProps.siteId : this.props.siteId,
			appendRoles,
			siteRoles;
		if ( siteId ) {
			siteRoles = RolesStore.getRoles( siteId );
			appendRoles = this.props.appendRoles || {};
			this.setState( {
				roles: Object.assign( {}, appendRoles, siteRoles )
			} );
		}
	},

	fetchRoles: function() {
		var siteId = this.props.siteId || null;
		if ( ! siteId ) {
			return;
		}

		if ( RolesStore.getRoles( siteId ).length ) {
			debug( 'initial fetch not necessary' );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( function() {
			var fetching = RolesStore.isFetching( siteId );
			if ( fetching ) {
				return;
			}
			RolesActions.fetch( siteId );
		}, 0 );
	},

	renderLabel: function() {
		if ( this.props.hideLabel ) {
			return null;
		}

		return (
			<FormLabel htmlFor={ this.props.id }>
				{ this.translate( 'Role', {
					context: 'Text that is displayed in a label of a form.'
				} ) }
			</FormLabel>
		);
	},

	render: function() {
		var roles = Object.keys( this.state.roles );
		return (
			<FormFieldset className="role-select" key={ this.props.key } disabled={ ! roles.length }>
				{ this.renderLabel() }
				<FormSelect { ...omit( this.props, [ 'site', 'key' ] ) }>
					{
						roles.map( function( role ) {
							return (
								<option value={ role } key={ role }>
									{ titleCase( role ) }
								</option>
							);
						} )
					}
				</FormSelect>
			</FormFieldset>
		);
	}
} );
