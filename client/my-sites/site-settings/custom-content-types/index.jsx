import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import BlogPosts from './blog-posts';
import Portfolios from './portfolios';
import Testimonials from './testimonials';

import './style.scss';

class CustomContentTypes extends Component {
	componentDidUpdate( prevProps ) {
		const {
			activatingCustomContentTypesModule,
			customContentTypesModuleActive,
			fields,
			isSavingSettings,
			siteId,
			siteIsJetpack,
		} = this.props;

		// Refresh menu after settings are saved in case CPTs have been registered or unregistered.
		if ( ! isSavingSettings && prevProps.isSavingSettings ) {
			this.props.requestAdminMenu( siteId );
		}

		if ( ! siteIsJetpack ) {
			return;
		}

		if ( customContentTypesModuleActive !== false ) {
			return;
		}

		if ( ! fields.jetpack_portfolio && ! fields.jetpack_testimonial ) {
			return;
		}

		if ( activatingCustomContentTypesModule ) {
			return;
		}

		this.props.activateModule( siteId, 'custom-content-types', true );
	}

	render() {
		const {
			translate,
			handleSubmitForm,
			isWPForTeamsSite,
			fields,
			onChangeField,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			activatingCustomContentTypesModule,
			isAtomic,
			siteIsJetpack,
		} = this.props;
		const isDisabled =
			isRequestingSettings || isSavingSettings || activatingCustomContentTypesModule;
		return (
			<>
				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Content types' ) }
				/>
				<Card className="custom-content-types site-settings">
					<BlogPosts
						fields={ fields }
						translate={ translate }
						onChangeField={ onChangeField }
						isDisabled={ isDisabled }
					/>

					{ ! isWPForTeamsSite && (
						<>
							<Testimonials
								fields={ fields }
								translate={ translate }
								onChangeField={ onChangeField }
								handleAutosavingToggle={ handleAutosavingToggle }
								isDisabled={ isDisabled }
								isAtomic={ isAtomic }
								siteIsJetpack={ siteIsJetpack }
							/>
							<Portfolios
								fields={ fields }
								translate={ translate }
								onChangeField={ onChangeField }
								handleAutosavingToggle={ handleAutosavingToggle }
								isDisabled={ isDisabled }
								isAtomic={ isAtomic }
								siteIsJetpack={ siteIsJetpack }
							/>
						</>
					) }
				</Card>
			</>
		);
	}
}

CustomContentTypes.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

CustomContentTypes.propTypes = {
	isAtomic: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
	handleAutosavingToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			customContentTypesModuleActive: isJetpackModuleActive(
				state,
				siteId,
				'custom-content-types'
			),
			activatingCustomContentTypesModule: isActivatingJetpackModule(
				state,
				siteId,
				'custom-content-types'
			),
		};
	},
	{
		activateModule,
		requestAdminMenu,
	}
)( localize( CustomContentTypes ) );
