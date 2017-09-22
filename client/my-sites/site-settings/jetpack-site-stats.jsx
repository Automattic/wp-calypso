/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import QuerySiteRoles from 'components/data/query-site-roles';
import ExternalLink from 'components/external-link';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';
import SectionHeader from 'components/section-header';
import { getStatsPathForTab } from 'lib/route/path';
import { activateModule } from 'state/jetpack/modules/actions';
import { isActivatingJetpackModule, isJetpackModuleActive, isJetpackModuleUnavailableInDevelopmentMode, isJetpackSiteInDevelopmentMode } from 'state/selectors';
import { getSiteRoles } from 'state/site-roles/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class JetpackSiteStats extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {}
	};

	static propTypes = {
		handleAutosavingToggle: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	onChangeToggleGroup = ( groupName, fieldName ) => {
		return () => {
			const { setFieldValue } = this.props;
			let groupFields = this.getCurrentGroupFields( groupName );

			if ( includes( groupFields, fieldName ) ) {
				groupFields = groupFields.filter( field => field !== fieldName );
			} else {
				groupFields.push( fieldName );
			}

			setFieldValue( groupName, groupFields, true );
		};
	};

	handleStatsActivationButton = ( event ) => {
		const { siteId } = this.props;

		this.props.activateModule( siteId, 'stats' );

		event.preventDefault();
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
			statsModuleActive
		} = this.props;

		if ( checked === null ) {
			checked = !! fields[ name ];
		}

		if ( onChange === null ) {
			onChange = handleAutosavingToggle( name );
		}

		return (
			<CompactFormToggle
				checked={ checked }
				disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable || ! statsModuleActive }
				onChange={ onChange }
				key={ name }
			>
				{ label }
			</CompactFormToggle>
		);
	}

	renderModuleEnableBanner() {
		const { translate } = this.props;

		return (
			<Banner
				title={ translate( 'Site Stats module is disabled' ) }
				description={
					translate( 'Enable this to see detailed information about your traffic, likes, comments, and subscribers.' )
				}
				callToAction={ translate( 'Enable' ) }
				onClick={ this.handleStatsActivationButton }
				event={ 'site_stats_module_enable_banner' }
				icon="stats"
			/>
		);
	}

	renderCardSettings() {
		const {
			siteRoles,
			siteSlug,
			translate
		} = this.props;
		const header = (
			<div>
				<Gridicon icon="checkmark" />
				{ translate( 'Enabled! You\'re collecting valuable data and insights.' ) }
			</div>
		);

		return (
			<div>
				<FoldableCard
					className="site-settings__foldable-card is-top-level"
					header={ header }
					clickableHeader
				>
					<FormFieldset>
						<div className="site-settings__info-link-container">
							<InfoPopover position="left">
								<ExternalLink href="https://jetpack.com/support/wordpress-com-stats/" target="_blank">
									{ translate( 'Learn more about WordPress.com Stats' ) }
								</ExternalLink>
							</InfoPopover>
						</div>

						{ this.renderToggle( 'admin_bar', translate( 'Put a chart showing 48 hours of views in the admin bar' ) ) }
						{ this.renderToggle( 'hide_smile', translate( 'Hide the stats smiley face image' ) ) }
						<FormSettingExplanation isIndented>
							{ translate( 'The image helps collect stats, but should work when hidden.' ) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>
							{ translate( 'Count logged in page views from' ) }
						</FormLegend>
						{
							siteRoles &&
							siteRoles.map(
								role => this.renderToggle(
									'count_roles_' + role.name,
									role.display_name,
									includes( this.getCurrentGroupFields( 'count_roles' ), role.name ),
									this.onChangeToggleGroup( 'count_roles', role.name )
								)
							)
						}
					</FormFieldset>

					<FormFieldset>
						<FormLegend>
							{ translate( 'Allow stats reports to be viewed by' ) }
						</FormLegend>
						{
							siteRoles &&
							siteRoles.map(
								role => this.renderToggle(
									'roles_' + role.name,
									role.display_name,
									includes( this.getCurrentGroupFields( 'roles' ), role.name ),
									this.onChangeToggleGroup( 'roles', role.name )
								)
							)
						}
					</FormFieldset>
				</FoldableCard>

				<CompactCard href={ getStatsPathForTab( 'day', siteSlug ) }>
					{ translate( 'View your site stats' ) }
				</CompactCard>
			</div>
		);
	}

	renderPlaceholder() {
		return (
			<Card className="site-settings__card is-placeholder">
				<div />
			</Card>
		);
	}

	renderCardContent() {
		const {
			activatingStatsModule,
			statsModuleActive
		} = this.props;

		if ( activatingStatsModule ) {
			return this.renderPlaceholder();
		}

		if ( statsModuleActive === true ) {
			return this.renderCardSettings();
		} else if ( statsModuleActive === false ) {
			return this.renderModuleEnableBanner();
		}
		return this.renderPlaceholder();
	}

	render() {
		const {
			siteId,
			translate
		} = this.props;

		return (
			<div className="site-settings__traffic-settings">
				<QueryJetpackConnection siteId={ siteId } />
				<QuerySiteRoles siteId={ siteId } />

				<SectionHeader label={ translate( 'Site stats' ) } />

				{ this.renderCardContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, siteId, 'stats' );

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state, siteId ),
			activatingStatsModule: isActivatingJetpackModule( state, siteId, 'stats' ),
			statsModuleActive: isJetpackModuleActive( state, siteId, 'stats' ),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			siteRoles: getSiteRoles( state, siteId ),
		};
	},
	{
		activateModule
	}
)( localize( JetpackSiteStats ) );
