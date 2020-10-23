/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormToggle from 'calypso/components/forms/form-toggle';
import FoldableCard from 'calypso/components/foldable-card';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import QuerySiteRoles from 'calypso/components/data/query-site-roles';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getSiteRoles } from 'calypso/state/site-roles/selectors';
import { getStatsPathForTab } from 'calypso/lib/route';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';

class JetpackSiteStats extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		handleAutosavingToggle: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
		path: PropTypes.string,
	};

	onChangeToggleGroup = ( groupName, fieldName ) => {
		return () => {
			const { setFieldValue, path } = this.props;

			this.props.recordTracksEvent( 'calypso_site_stats_toggle_group_changed', {
				path,
				group: groupName,
				field: fieldName,
			} );

			let groupFields = this.getCurrentGroupFields( groupName );

			if ( includes( groupFields, fieldName ) ) {
				groupFields = groupFields.filter( ( field ) => field !== fieldName );
			} else {
				groupFields.push( fieldName );
			}

			setFieldValue( groupName, groupFields, true );
		};
	};

	getCurrentGroupFields( groupName ) {
		const { fields } = this.props;

		if ( ! fields[ groupName ] ) {
			return [];
		}
		return fields[ groupName ];
	}

	renderToggle( name, label, checked = null, onChange = null ) {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			moduleUnavailable,
			statsModuleActive,
		} = this.props;

		if ( checked === null ) {
			checked = !! fields[ name ];
		}

		if ( onChange === null ) {
			onChange = handleAutosavingToggle( name );
		}

		return (
			<FormToggle
				checked={ checked }
				disabled={
					isRequestingSettings || isSavingSettings || moduleUnavailable || ! statsModuleActive
				}
				onChange={ onChange }
				key={ name }
			>
				{ label }
			</FormToggle>
		);
	}

	render() {
		const { moduleUnavailable, siteId, siteRoles, siteSlug, translate } = this.props;

		const header = (
			<JetpackModuleToggle
				siteId={ siteId }
				moduleSlug="stats"
				label={ translate(
					'See detailed information about your traffic, likes, comments, and subscribers.'
				) }
				disabled={ moduleUnavailable }
			/>
		);

		return (
			<div className="site-settings__traffic-settings">
				<QueryJetpackConnection siteId={ siteId } />
				<QuerySiteRoles siteId={ siteId } />

				<SettingsSectionHeader title={ translate( 'Site stats' ) } />

				<FoldableCard
					className="site-settings__foldable-card is-top-level"
					header={ header }
					clickableHeader
				>
					<FormFieldset>
						<SupportInfo
							text={ translate(
								'Displays information on your site activity, ' +
									'including visitors and popular posts or pages.'
							) }
							link="https://jetpack.com/support/wordpress-com-stats/"
						/>
						{ this.renderToggle(
							'admin_bar',
							translate( 'Put a chart showing 48 hours of views in the admin bar' )
						) }
						{ this.renderToggle( 'hide_smile', translate( 'Hide the stats smiley face image' ) ) }
						<FormSettingExplanation isIndented>
							{ translate( 'The image helps collect stats, but should work when hidden.' ) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>{ translate( 'Count logged in page views from' ) }</FormLegend>
						{ siteRoles &&
							siteRoles.map( ( role ) =>
								this.renderToggle(
									'count_roles_' + role.name,
									role.display_name,
									includes( this.getCurrentGroupFields( 'count_roles' ), role.name ),
									this.onChangeToggleGroup( 'count_roles', role.name )
								)
							) }
					</FormFieldset>

					<FormFieldset>
						<FormLegend>{ translate( 'Allow stats reports to be viewed by' ) }</FormLegend>
						{ siteRoles &&
							siteRoles.map( ( role ) =>
								this.renderToggle(
									'roles_' + role.name,
									role.display_name,
									includes( this.getCurrentGroupFields( 'roles' ), role.name ),
									this.onChangeToggleGroup( 'roles', role.name )
								)
							) }
					</FormFieldset>
				</FoldableCard>

				<CompactCard href={ getStatsPathForTab( 'day', siteSlug ) }>
					{ translate( 'View your site stats' ) }
				</CompactCard>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			siteId,
			'stats'
		);
		const path = getCurrentRouteParameterized( state, siteId );

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state, siteId ),
			statsModuleActive: isJetpackModuleActive( state, siteId, 'stats' ),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			siteRoles: getSiteRoles( state, siteId ),
			path,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( JetpackSiteStats ) );
