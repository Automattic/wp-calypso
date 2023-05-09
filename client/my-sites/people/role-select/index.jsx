import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySites from 'calypso/components/data/query-sites';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import useSiteRolesQuery from 'calypso/data/site-roles/use-site-roles-query';
import getWpcomFollowerRole from 'calypso/lib/get-wpcom-follower-role';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { ROLES_LIST } from './constants';

import './style.scss';

export const tip = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="12" cy="9" r="5" stroke="#A7AAAD" strokeWidth="1.42857" />
		<line x1="9" y1="16.8818" x2="15" y2="16.8818" stroke="#A7AAAD" strokeWidth="1.5" />
		<line x1="10" y1="19.25" x2="14" y2="19.25" stroke="#A7AAAD" strokeWidth="1.5" />
	</svg>
);

export default function RoleSelect( {
	includeFollower,
	includeSubscriber,
	siteId,
	id,
	explanation,
	value,
	formControlType = 'radio',
	showLabel = true,
	...rest
} ) {
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

		if ( ! includeSubscriber ) {
			// Remove subscriber role from the roles list
			// https://github.com/Automattic/wp-calypso/issues/65776
			siteRoles = siteRoles.filter( ( x ) => x.name !== 'subscriber' );
		}
	}

	if ( formControlType === 'select' ) {
		return (
			<FormFieldset key={ siteId } disabled={ ! siteRoles }>
				{ showLabel && <FormLabel htmlFor={ id }>{ translate( 'Role' ) }</FormLabel> }
				<FormSelect { ...rest } id={ id } value={ value }>
					{ siteRoles &&
						siteRoles.map( ( role ) => (
							<option key={ role.name } value={ role.name }>
								{ role.display_name }
							</option>
						) ) }
				</FormSelect>
				{ explanation && ROLES_LIST[ value ] && (
					<FormSettingExplanation className="with-icon">
						<Icon icon={ tip } /> { ROLES_LIST[ value ].getDescription( isWPForTeamsSite ) }
						{ explanation && <>&nbsp;{ explanation }</> }
					</FormSettingExplanation>
				) }
			</FormFieldset>
		);
	} else if ( formControlType === 'radio' ) {
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

	return null;
}
