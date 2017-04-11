/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import FoldableCard from 'components/foldable-card';
import SectionHeader from 'components/section-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import QuerySiteRoles from 'components/data/query-site-roles';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteRoles } from 'state/site-roles/selectors';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode
} from 'state/selectors';

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

			if ( groupFields.includes( fieldName ) ) {
				groupFields = groupFields.filter( field => field !== fieldName );
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

	render() {
		const {
			siteId,
			siteRoles,
			translate
		} = this.props;
		const header = (
			<div>
				<Gridicon icon="checkmark" />
				{ translate( 'Collecting valuable traffic stats and insights' ) }
			</div>
		);

		return (
			<div className="site-settings__traffic-settings">
				<QueryJetpackConnection siteId={ siteId } />
				<QuerySiteRoles siteId={ siteId } />

				<SectionHeader label={ translate( 'Site stats' ) } />

				<FoldableCard
					className="site-settings__foldable-card is-top-level"
					header={ header }
					clickableHeader
				>
					<FormFieldset>
						<div className="site-settings__info-link-container">
							<InfoPopover position={ 'left' }>
								<ExternalLink href={ 'https://jetpack.com/support/wordpress-com-stats/' } target="_blank">
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
									this.getCurrentGroupFields( 'count_roles' ).includes( role.name ),
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
									this.getCurrentGroupFields( 'roles' ).includes( role.name ),
									this.onChangeToggleGroup( 'roles', role.name )
								)
							)
						}
					</FormFieldset>
				</FoldableCard>
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
			statsModuleActive: !! isJetpackModuleActive( state, siteId, 'stats' ),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			siteRoles: getSiteRoles( state, siteId ),
		};
	}
)( localize( JetpackSiteStats ) );
