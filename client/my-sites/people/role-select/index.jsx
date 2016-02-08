/**
 * External dependencies
 */
var React = require( 'react' ),
	debugFactory = require( 'debug' ),
	omit = require( 'lodash/object/omit' ),
	map = require( 'lodash/collection/map' );

var RolesStore = require( 'lib/site-roles/store' ),
	RolesActions = require( 'lib/site-roles/actions' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSelect = require( 'components/forms/form-select' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	sites = require( 'lib/sites-list' )();

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

	getWPCOMFollowerRole( siteId ) {
		siteId = siteId ? siteId : this.props.siteId;

		let site = sites.getSite( siteId ),
			displayName = site.is_private
			? this.translate( 'Viewer', { context: 'Role that is displayed in a select' } )
			: this.translate( 'Follower', { context: 'Role that is displayed in a select' } );

		return {
			follower: {
				display_name: displayName,
				name: 'follower'
			}
		};
	},

	refreshRoles: function( nextProps ) {
		var siteId = nextProps && nextProps.siteId ? nextProps.siteId : this.props.siteId,
			siteRoles;

		if ( siteId ) {
			siteRoles = RolesStore.getRoles( siteId );

			if ( this.props.includeFollower ) {
				siteRoles = Object.assign( {}, this.getWPCOMFollowerRole(), siteRoles )
			}

			this.setState( {
				roles: siteRoles
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

	render: function() {
		var roleKeys = Object.keys( this.state.roles );
		return (
			<FormFieldset key={ this.props.key } disabled={ ! roleKeys.length }>
				<FormLabel htmlFor={ this.props.id }>
					{ this.translate( 'Role', {
						context: 'Text that is displayed in a label of a form.'
					} ) }
				</FormLabel>
				<FormSelect { ...omit( this.props, [ 'site', 'key' ] ) }>
					{
						map( this.state.roles, ( roleObject, key ) => {
							return (
								<option value={ key } key={ key }>
									{ roleObject.display_name }
								</option>
							);
						} )
					}
				</FormSelect>
				{ this.props.explanation &&
					<FormSettingExplanation>
						{ this.props.explanation }
					</FormSettingExplanation>
				}
			</FormFieldset>
		);
	}
} );
