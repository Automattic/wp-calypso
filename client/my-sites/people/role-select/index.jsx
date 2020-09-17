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
import { getSiteRoles, getWpcomFollowerRole } from 'state/site-roles/selectors';
import { ROLES_LIST } from './constants';
import isSiteWPForTeams from 'state/selectors/is-site-wpforteams';

import './style.scss';

const RoleSelect = ( props ) => {
	let { siteRoles } = props;
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

	if ( site && siteRoles && includeFollower ) {
		siteRoles = siteRoles.concat( wpcomFollowerRole );
	}

	if ( site && siteRoles && isWPForTeamsSite ) {
		siteRoles = siteRoles.filter( ( role ) => role.name !== 'contributor' );
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
					);
				} ) }
			{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
		</FormFieldset>
	);
};

export default connect( ( state, ownProps ) => ( {
	site: getSite( state, ownProps.siteId ),
	siteRoles: getSiteRoles( state, ownProps.siteId ),
	isWPForTeamsSite: isSiteWPForTeams( state, ownProps.siteId ),
	wpcomFollowerRole: getWpcomFollowerRole( state, ownProps.siteId ),
} ) )( localize( RoleSelect ) );
