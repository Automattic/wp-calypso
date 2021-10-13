import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySites from 'calypso/components/data/query-sites';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import useSiteRolesQuery from 'calypso/data/site-roles/use-site-roles-query';
import getWpcomFollowerRole from 'calypso/lib/get-wpcom-follower-role';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { ROLES_LIST } from './constants';

import './style.scss';

export default function RoleSelect( { includeFollower, siteId, id, explanation, value, ...rest } ) {
	const translate = useTranslate();
	const { data } = useSiteRolesQuery( siteId );
	const isSitePrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );

	let siteRoles;

	if ( data ) {
		siteRoles = data;

		if ( includeFollower ) {
			const wpcomFollowerRole = getWpcomFollowerRole( isSitePrivate, translate );
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
								{ ...rest }
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
}
