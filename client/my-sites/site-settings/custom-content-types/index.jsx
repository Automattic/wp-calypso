import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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
			isWPForTeamsSite,
			fields,
			onChangeField,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			activatingCustomContentTypesModule,
			siteIsAutomatedTransfer,
		} = this.props;
		const isDisabled =
			isRequestingSettings || isSavingSettings || activatingCustomContentTypesModule;
		return (
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
							siteIsAutomatedTransfer={ siteIsAutomatedTransfer }
						/>
						<Portfolios
							fields={ fields }
							translate={ translate }
							onChangeField={ onChangeField }
							handleAutosavingToggle={ handleAutosavingToggle }
							isDisabled={ isDisabled }
							siteIsAutomatedTransfer={ siteIsAutomatedTransfer }
						/>
					</>
				) }
			</Card>
		);
	}
}

CustomContentTypes.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

CustomContentTypes.propTypes = {
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
			siteIsJetpack: isJetpackSite( state, siteId ),
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
