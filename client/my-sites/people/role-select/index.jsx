/**
 * External dependencies
 */

import React from 'react';
import { omit } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import QuerySites from 'calypso/components/data/query-sites';
import { getSite, getWpcomFollowerRole } from 'calypso/state/sites/selectors';
import { ROLES_LIST } from './constants';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import useSiteRolesQuery from 'calypso/data/site-roles/use-site-roles-query';

import './style.scss';

const RoleSelect = ( props ) => {
	const { data } = useSiteRolesQuery( props.siteId );
	const { isWPForTeamsSite } = props;

	const {
		site,
		includeFollower,
		wpcomFollowerRole,
		siteId,
		id,
		explanation,
		translate,
		value,
	} = props;

	const omitProps = [
		'isWPForTeamsSite',
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
		'wpcomFollowerRole',
	];

	let siteRoles;

	if ( site && data ) {
		siteRoles = data;

		if ( includeFollower ) {
			siteRoles = siteRoles.concat( wpcomFollowerRole );
		}
	}

	return (
		<FormFieldset key={ siteId } disabled={ ! siteRoles } id={ id }>
			{ siteId && <QuerySites siteId={ siteId } /> }
			<FormLabel htmlFor={ id }>{ translate( 'Role' ) }</FormLabel>
			{ siteRoles &&
				siteRoles.map( ( role ) => (
					<FormLabel key={ role.name }>
						<div className="role-select__role-wrapper">
							<FormRadio
								className="role-select__role-radio"
								checked={ role.name === value }
								value={ role.name }
								{ ...omit( props, omitProps ) }
							/>
							<div className="role-select__role-name">
								<div>{ role.display_name }</div>
								{ ROLES_LIST[ role.name ] && (
									<div className="role-select__role-name-description">
										{ ROLES_LIST[ role.name ].getDescription( isWPForTeamsSite ) }
									</div>
								) }
							</div>
						</div>
					</FormLabel>
				) ) }
			{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
		</FormFieldset>
	);
};

export default connect( ( state, ownProps ) => ( {
	site: getSite( state, ownProps.siteId ),
	isWPForTeamsSite: isSiteWPForTeams( state, ownProps.siteId ),
	wpcomFollowerRole: getWpcomFollowerRole( state, ownProps.siteId ),
} ) )( localize( RoleSelect ) );
