/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import QuerySites from 'components/data/query-sites';
import QuerySiteRoles from 'components/data/query-site-roles';
import { getSite } from 'state/sites/selectors';
import { getSiteRoles } from 'state/site-roles/selectors';

const getWPCOMFollowerRole = ( { site, translate } ) => {
	const displayName = site.is_private
		? translate( 'Viewer', { context: 'Role that is displayed in a select' } )
		: translate( 'Follower', { context: 'Role that is displayed in a select' } );

	return {
		display_name: displayName,
		name: 'follower'
	};
};

const RoleSelect = ( props ) => {
	const { siteRoles, site, includeFollower, siteId, id, explanation, translate } = props;
	const roles = siteRoles && siteRoles.slice( 0 );
	const omitProps = [
		'site',
		'key',
		'siteId',
		'includeFollower',
		'explanation',
		'siteRoles',
		'dispatch',
		'moment',
		'numberFormat',
		'translate'
	];

	if ( site && roles && includeFollower ) {
		roles.push( getWPCOMFollowerRole( props ) );
	}

	return (
		<FormFieldset key={ siteId } disabled={ ! roles }>
			{ siteId &&
				<QuerySites siteId={ siteId } /> &&
				<QuerySiteRoles siteId={ siteId } />
			}
			<FormLabel htmlFor={ id }>
				{ translate( 'Role', {
					context: 'Text that is displayed in a label of a form.'
				} ) }
			</FormLabel>
			<FormSelect { ...omit( props, omitProps ) }>
				{
					roles && roles.map( ( role ) => {
						return (
							<option value={ role.name } key={ role.name }>
								{ role.display_name }
							</option>
						);
					} )
				}
			</FormSelect>
			{ explanation &&
				<FormSettingExplanation>
					{ explanation }
				</FormSettingExplanation>
			}
		</FormFieldset>
	);
};

export default connect(
	( state, ownProps ) => ( {
		site: getSite( state, ownProps.siteId ),
		siteRoles: getSiteRoles( state, ownProps.siteId ),
	} )
)( localize( RoleSelect ) );
