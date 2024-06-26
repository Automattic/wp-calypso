import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useSelector } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { activateModule, deactivateModule } from 'calypso/state/jetpack/modules/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import {
	getSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
} from 'calypso/state/site-settings/selectors';
import { isJetpackSite, isJetpackMinimumVersion } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ButtonsAppearance from './appearance';
import ButtonsBlockAppearance from './components/buttons-block-appearance';
import ButtonsOptions from './options';
import { useSharingButtonsQuery, useSaveSharingButtonsMutation } from './use-sharing-buttons-query';

class SharingButtons extends Component {
	state = {
		values: {},
		buttonsPendingSave: null,
	};

	static propTypes = {
		buttons: PropTypes.array,
		isSaving: PropTypes.bool,
		isSaveSettingsSuccessful: PropTypes.bool,
		isSaveButtonsSuccessful: PropTypes.bool,
		markSaved: PropTypes.func,
		markChanged: PropTypes.func,
		settings: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	saveChanges = ( event ) => {
		const { isJetpack, isLikesModuleActive, siteId, path } = this.props;

		event.preventDefault();

		this.props.saveSiteSettings( this.props.siteId, this.state.values );
		if ( this.state.buttonsPendingSave ) {
			this.props.saveSharingButtons( this.state.buttonsPendingSave );
		}
		this.props.recordTracksEvent( 'calypso_sharing_buttons_save_changes_click', { path } );
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Save Changes Button' );

		if ( ! isJetpack || isLikesModuleActive !== false ) {
			return;
		}

		const updatedSettings = this.getUpdatedSettings();
		if ( updatedSettings.disabled_likes ) {
			return;
		}

		this.props.activateModule( siteId, 'likes', true );
	};

	handleChange = ( option, value ) => {
		const pairs = undefined === value ? option : { [ option ]: value };
		this.props.markChanged();
		this.setState( {
			values: Object.assign( {}, this.state.values, pairs ),
		} );
	};

	handleButtonsChange = ( buttons ) => {
		this.props.markChanged();
		this.setState( { buttonsPendingSave: buttons } );
	};

	componentDidUpdate( prevProps ) {
		// Save request has been performed
		if (
			( prevProps.isSavingSettings || prevProps.isSavingButtons ) &&
			! ( this.props.isSavingSettings || this.props.isSavingButtons )
		) {
			if (
				this.props.isSaveSettingsSuccessful &&
				( this.props.isSaveButtonsSuccessful || ! prevProps.buttonsPendingSave )
			) {
				this.props.successNotice( this.props.translate( 'Settings saved successfully!' ) );
				this.props.markSaved();
				// eslint-disable-next-line react/no-did-update-set-state
				this.setState( {
					values: {},
					buttonsPendingSave: null,
				} );
			} else {
				this.props.errorNotice(
					this.props.translate( 'There was a problem saving your changes. Please, try again.' )
				);
			}
		}
	}

	getUpdatedSettings() {
		const { isJetpack, isLikesModuleActive, settings } = this.props;
		const disabledSettings =
			isJetpack && isLikesModuleActive === false
				? {
						// Like button should be disabled if the Likes Jetpack module is deactivated.
						disabled_likes: true,
				  }
				: {};

		return Object.assign( {}, settings, disabledSettings, this.state.values );
	}

	render() {
		const {
			buttons,
			isBlockTheme,
			isJetpack,
			isSavingSettings,
			isSavingButtons,
			settings,
			siteId,
			isSharingButtonsModuleActive,
			isFetchingModules,
			isPrivate,
			siteSlug,
			supportsSharingBlock,
			translate,
		} = this.props;
		const updatedSettings = this.getUpdatedSettings();
		const updatedButtons = this.state.buttonsPendingSave || buttons;
		const isSaving = isSavingSettings || isSavingButtons;
		const isSharingModuleInactive =
			isJetpack && ! isFetchingModules && ! isSharingButtonsModuleActive;

		if ( isBlockTheme && supportsSharingBlock && isSharingModuleInactive ) {
			return <ButtonsBlockAppearance isJetpack={ isJetpack } siteId={ siteId } />;
		}

		return (
			<form
				onSubmit={ this.saveChanges }
				id="sharing-buttons"
				className="buttons__sharing-settings buttons__sharing-buttons"
			>
				<PageViewTracker
					path="/marketing/sharing-buttons/:site"
					title="Marketing > Sharing Buttons"
				/>
				<QuerySiteSettings siteId={ siteId } />
				{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }

				{ /* Rendering notice in a separate function */ }
				{ isSharingModuleInactive && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={
							isPrivate
								? translate( 'Adding sharing buttons requires your site to be marked as Public.' )
								: translate(
										'Adding sharing buttons needs the Sharing Buttons module from Jetpack to be enabled.'
								  )
						}
					>
						<NoticeAction
							href={ isPrivate ? '/settings/general/' + siteSlug + '#site-privacy-settings' : null }
							onClick={ isPrivate ? null : () => this.props.activateModule( siteId, 'sharedaddy' ) }
						>
							{ isPrivate ? translate( 'Change settings' ) : translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				) }
				{ ! isFetchingModules && ! isSharingModuleInactive && isBlockTheme && (
					<Notice
						status="is-info"
						showDismiss={ false }
						text={ translate(
							'You are using a block-based theme. We recommend you disable the legacy sharing feature below and add a sharing button block to your themes’s template instead.'
						) }
					>
						{ isJetpack && (
							<NoticeAction onClick={ () => this.props.deactivateModule( siteId, 'sharedaddy' ) }>
								{ translate( 'Disable' ) }
							</NoticeAction>
						) }
					</Notice>
				) }

				<ButtonsOptions
					buttons={ buttons }
					settings={ updatedSettings }
					onChange={ this.handleChange }
					saving={ isSaving }
				/>
				<ButtonsAppearance
					buttons={ updatedButtons }
					values={ updatedSettings }
					onChange={ this.handleChange }
					onButtonsChange={ this.handleButtonsChange }
					initialized={ !! buttons && !! settings }
					saving={ isSaving }
				/>
			</form>
		);
	}
}

const withSharingButtons = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data: buttons } = useSharingButtonsQuery( siteId );
		const {
			saveSharingButtons,
			isLoading: isSavingButtons,
			isSuccess: isSaveButtonsSuccessful,
		} = useSaveSharingButtonsMutation( siteId );
		const { data: activeThemeData } = useActiveThemeQuery( siteId, true );
		const isBlockTheme = activeThemeData?.[ 0 ]?.is_block_theme ?? false;

		return (
			<Wrapped
				{ ...props }
				buttons={ buttons }
				saveSharingButtons={ saveSharingButtons }
				isSavingButtons={ isSavingButtons }
				isSaveButtonsSuccessful={ isSaveButtonsSuccessful }
				isBlockTheme={ isBlockTheme }
			/>
		);
	},
	'WithSharingButtons'
);

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const settings = getSiteSettings( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const isSharingButtonsModuleActive = isJetpackModuleActive( state, siteId, 'sharedaddy' );
		const isLikesModuleActive = isJetpackModuleActive( state, siteId, 'likes' );
		const isFetchingModules = isFetchingJetpackModules( state, siteId );
		const isSavingSettings = isSavingSiteSettings( state, siteId );
		const isSaveSettingsSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
		const isPrivate = isPrivateSite( state, siteId );
		const path = getCurrentRouteParameterized( state, siteId );
		const supportsSharingBlock = ! isJetpack || isJetpackMinimumVersion( state, siteId, '13.1' );

		return {
			isJetpack,
			isSharingButtonsModuleActive,
			isLikesModuleActive,
			isFetchingModules,
			isSavingSettings,
			isSaveSettingsSuccessful,
			isPrivate,
			settings,
			siteId,
			siteSlug,
			path,
			supportsSharingBlock,
		};
	},
	{
		activateModule,
		deactivateModule,
		errorNotice,
		recordGoogleEvent,
		recordTracksEvent,
		saveSiteSettings,
		successNotice,
	}
);

export default connectComponent( protectForm( localize( withSharingButtons( SharingButtons ) ) ) );
