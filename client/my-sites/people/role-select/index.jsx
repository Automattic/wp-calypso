/**
 * External dependencies
 */

import React from 'react';
import { omit, map } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import QuerySites from 'components/data/query-sites';
import QuerySiteRoles from 'components/data/query-site-roles';
import { getSite } from 'state/sites/selectors';
import { getSiteRoles } from 'state/site-roles/selectors';

const getWpcomFollowerRole = ( { site, translate } ) => {
	const displayName = site.is_private
		? translate( 'Viewer', { context: 'Role that is displayed in a select' } )
		: translate( 'Follower', { context: 'Role that is displayed in a select' } );

	return {
		display_name: displayName,
		name: 'follower',
	};
};

const RoleSelect = ( props ) => {
	let { siteRoles } = props;
	const { site, includeFollower, siteId, id, explanation, translate, value } = props;
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
		'translate',
		'value',
		'id',
	];

	if ( site && siteRoles && includeFollower ) {
		siteRoles = siteRoles.concat( getWpcomFollowerRole( props ) );
	}

	return (
		<FormFieldset key={ siteId } disabled={ ! siteRoles } id={ id }>
			{ siteId && <QuerySites siteId={ siteId } /> }
			{ siteId && <QuerySiteRoles siteId={ siteId } /> }
			<FormLabel htmlFor={ id }>{ translate( 'Role' ) }</FormLabel>
			{ siteRoles &&
				map( siteRoles, ( role ) => {
					return (
						<FormLabel key={ role.name }>
							<FormRadio
								checked={ role.name === value }
								value={ role.name }
								{ ...omit( props, omitProps ) }
							/>
							<span>{ role.display_name }</span>
						</FormLabel>
					);
				} ) }
			{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
		</FormFieldset>
	);
};

export default connect( ( state, ownProps ) => ( {
	site: getSite( state, ownProps.siteId ),
	siteRoles: getSiteRoles( state, ownProps.siteId ),
} ) )( localize( RoleSelect ) );
