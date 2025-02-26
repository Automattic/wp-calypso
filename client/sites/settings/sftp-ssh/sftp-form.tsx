import config from '@automattic/calypso-config';
import { FEATURE_SFTP, FEATURE_SSH } from '@automattic/calypso-products';
import { Button, FormLabel, Spinner, ExternalLink } from '@automattic/components';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { useCompleteLaunchpadTasksWithNotice } from 'calypso/launchpad/hooks/use-complete-launchpad-tasks-with-notice';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { useSelector } from 'calypso/state';
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	requestAtomicSftpUsers,
	createAtomicSftpUser,
	resetAtomicSftpPassword,
	requestAtomicSshAccess,
	updateAtomicSftpUser,
	enableAtomicSshAccess,
	disableAtomicSshAccess,
} from 'calypso/state/hosting/actions';
import { getAtomicHostingIsLoadingSftpUsers } from 'calypso/state/selectors/get-atomic-hosting-is-loading-sftp-users';
import { getAtomicHostingIsLoadingSshAccess } from 'calypso/state/selectors/get-atomic-hosting-is-loading-ssh-access';
import { getAtomicHostingSftpUsers } from 'calypso/state/selectors/get-atomic-hosting-sftp-users';
import { getAtomicHostingSshAccess } from 'calypso/state/selectors/get-atomic-hosting-ssh-access';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useSftpSshSettingTitle from './hooks/use-sftp-ssh-setting-title';
import { SftpCardLoadingPlaceholder } from './sftp-card-loading-placeholder';
import SshKeys from './ssh-keys';
import './sftp-form.scss';

const FILEZILLA_URL = 'https://filezilla-project.org/';
const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = 22;

const resetSftpPassword = ( siteId: number | null, sshUsername: string | null ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent( 'Hosting Configuration', 'Clicked "Reset Password" Button in SFTP Card' ),
			recordTracksEvent( 'calypso_hosting_configuration_reset_sftp_password' ),
			bumpStat( 'hosting-config', 'reset-sftp-password' )
		),
		resetAtomicSftpPassword( siteId, sshUsername )
	);

const createSftpUser = ( siteId: number | null, currentUserId: number | null ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Hosting Configuration',
				'Clicked "Create SFTP Credentials" Button in SFTP Card'
			),
			recordTracksEvent( 'calypso_hosting_configuration_create_sftp_user' ),
			bumpStat( 'hosting-config', 'create-sftp-user' )
		),
		createAtomicSftpUser( siteId, currentUserId )
	);

const enableSshAccess = ( siteId: number | null ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_hosting_configuration_enable_ssh_access' ),
			bumpStat( 'hosting-config', 'enable-ssh-access' )
		),
		enableAtomicSshAccess( siteId )
	);

const disableSshAccess = ( siteId: number | null ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_hosting_configuration_disable_ssh_access' ),
			bumpStat( 'hosting-config', 'disable-ssh-access' )
		),
		disableAtomicSshAccess( siteId )
	);

type SftpFormProps = {
	disabled?: boolean;
};

export const SftpForm = ( { disabled }: SftpFormProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const currentUserId = useSelector( getCurrentUserId );
	const siteHasSftpFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SFTP )
	);
	const siteHasSshFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SSH )
	);
	const isSshAccessEnabled =
		'ssh' === useSelector( ( state ) => getAtomicHostingSshAccess( state, siteId ) );
	const isLoadingSshAccess = useSelector( ( state ) =>
		getAtomicHostingIsLoadingSshAccess( state, siteId )
	);
	const isLoadingSftpUsers = useSelector( ( state ) =>
		getAtomicHostingIsLoadingSftpUsers( state, siteId )
	);

	let username: string | null | undefined = undefined;
	let password: string | null | undefined = undefined;
	const atomicSftpUsers = useSelector( ( state ) => getAtomicHostingSftpUsers( state, siteId ) );
	if ( ! disabled && atomicSftpUsers !== null ) {
		if ( atomicSftpUsers.length ) {
			// Pick first user. Rest of users will be handled in next phases.
			username = atomicSftpUsers[ 0 ].username;
			password = atomicSftpUsers[ 0 ].password;
		} else {
			// No SFTP user created yet.
			username = null;
			password = null;
		}
	}

	// State for clipboard copy button for both username and password data
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isPasswordLoading, setPasswordLoading ] = useState( false );
	const [ isSshAccessLoading, setSshAccessLoading ] = useState( false );
	const hasSftpFeatureAndIsLoading = siteHasSftpFeature && isLoadingSftpUsers;
	const hasSshFeatureAndIsLoading = siteHasSshFeature && isLoadingSshAccess;
	const siteIntent = useSiteOption( 'site_intent' );
	const completeTasks = useCompleteLaunchpadTasksWithNotice();

	const sshConnectString = `ssh ${ username }@sftp.wp.com`;

	const handleResetPassword = () => {
		setPasswordLoading( true );
		dispatch( resetSftpPassword( siteId, username as string ) );
	};

	const handleCreateUser = () => {
		setIsLoading( true );
		dispatch( createSftpUser( siteId, currentUserId ) );
		if ( 'host-site' === siteIntent ) {
			completeTasks( [ 'setup_ssh' ], translate( 'You’ve set up SSH access!' ), {
				id: 'site-setup-ssh',
				duration: 10000,
			} );
		}
	};

	const handleToggleSshAccess = () => {
		setSshAccessLoading( true );
		if ( isSshAccessEnabled ) {
			dispatch( disableSshAccess( siteId ) );
		} else {
			dispatch( enableSshAccess( siteId ) );
		}
	};

	useEffect( () => {
		if ( ! disabled ) {
			setIsLoading( true );
			if ( siteHasSftpFeature ) {
				dispatch( requestAtomicSftpUsers( siteId ) );
			}
			if ( siteHasSshFeature ) {
				dispatch( requestAtomicSshAccess( siteId ) );
			}
		}
	}, [ disabled, siteId, siteHasSshFeature, siteHasSftpFeature, dispatch ] );

	// For security reasons we remove the password from the state when the component is unmounted
	// Since users should reset it every time they want to see it
	useEffect(
		() => () => {
			if ( password ) {
				dispatch( updateAtomicSftpUser( siteId, [ { username, password: null } ] ) );
			}
		},
		[ username, password, siteId, dispatch ]
	);

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
			setPasswordLoading( false );
		}
	}, [ username, password, siteHasSftpFeature ] );

	useEffect( () => {
		setSshAccessLoading( false );
	}, [ isSshAccessEnabled ] );

	const renderPasswordField = () => {
		if ( disabled ) {
			return <span></span>;
		}

		if ( password ) {
			return (
				<>
					<ClipboardButtonInput
						className="sftp-card__input"
						id="password"
						name="password"
						value={ password }
					/>
					<p>
						{ translate(
							'Save your password somewhere safe. You will need to reset it to view it again.'
						) }
					</p>
				</>
			);
		}

		return (
			<>
				<div className="sftp-card__password-explainer">
					{ translate( 'For security reasons, you must reset your password to view it.' ) }
				</div>
				<Button
					onClick={ handleResetPassword }
					disabled={ isPasswordLoading }
					busy={ isPasswordLoading }
				>
					{ translate( 'Reset password' ) }
				</Button>
			</>
		);
	};

	const renderSshField = () => {
		return (
			<div className="sftp-card__ssh-field">
				<ToggleControl
					__nextHasNoMarginBottom
					disabled={ isLoading || isSshAccessLoading }
					checked={ isSshAccessEnabled }
					onChange={ handleToggleSshAccess }
					label={ translate(
						'Enable SSH access for this site. {{supportLink}}Learn more{{/supportLink}}',
						{
							components: {
								supportLink: (
									<InlineSupportLink supportContext="hosting-connect-to-ssh" showIcon={ false } />
								),
							},
						}
					) }
				/>
				{ isSshAccessEnabled && (
					<ClipboardButtonInput
						className="sftp-card__input"
						id="ssh"
						name="ssh"
						value={ sshConnectString }
					/>
				) }
			</div>
		);
	};
	const displayQuestionsAndButton =
		! hasSftpFeatureAndIsLoading && ! hasSshFeatureAndIsLoading && ! ( username || isLoading );
	const showSshPanel = ! siteHasSftpFeature || siteHasSshFeature;

	const featureExplanation = siteHasSshFeature
		? translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client. Optionally, enable SSH to perform advanced site operations using the command line."
		  )
		: translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
		  );

	const form = (
		<div className="sftp-card__wrapper">
			{ displayQuestionsAndButton && (
				<div className="sftp-card__questions-container">
					<PanelBody
						title={ translate( 'What is SFTP?' ) }
						initialOpen={ false }
						onToggle={ () =>
							dispatch( recordTracksEvent( 'calypso_hosting_configuration_toggle_sftp_card' ) )
						}
					>
						{ translate(
							'SFTP stands for Secure File Transfer Protocol (or SSH File Transfer Protocol). It’s a secure way for you to access your website files on your local computer via a client program such as {{a}}Filezilla{{/a}}. ' +
								'For more information see {{supportLink}}SFTP on WordPress.com{{/supportLink}}.',
							{
								components: {
									a: <ExternalLink icon target="_blank" href={ FILEZILLA_URL } />,
									supportLink: (
										<InlineSupportLink supportContext="hosting-sftp" showIcon={ false } />
									),
								},
							}
						) }
					</PanelBody>
					{ showSshPanel && (
						<PanelBody
							title={ translate( 'What is SSH?' ) }
							initialOpen={ false }
							onToggle={ () =>
								dispatch( recordTracksEvent( 'calypso_hosting_configuration_toggle_ssh_card' ) )
							}
						>
							{ translate(
								'SSH stands for Secure Shell. It’s a way to perform advanced operations on your site using the command line. ' +
									'For more information see {{supportLink}}Connect to SSH on WordPress.com{{/supportLink}}.',
								{
									components: {
										supportLink: (
											<InlineSupportLink
												supportContext="hosting-connect-to-ssh"
												showIcon={ false }
											/>
										),
									},
								}
							) }
						</PanelBody>
					) }
				</div>
			) }
			{ displayQuestionsAndButton && (
				<>
					<p className="sftp-card__enable-warning">
						{ translate(
							'{{strong}}Ready to access your website files?{{/strong}} Keep in mind, if mistakes happen you can restore your last backup, but will lose changes made after the backup date.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<Button onClick={ handleCreateUser }>{ translate( 'Create credentials' ) }</Button>
				</>
			) }
			{ username && (
				<FormFieldset>
					<FormLabel htmlFor="url">{ translate( 'URL' ) }</FormLabel>
					<ClipboardButtonInput
						className="sftp-card__input"
						id="url"
						name="url"
						value={ SFTP_URL }
					/>
					<FormLabel htmlFor="port">{ translate( 'Port' ) }</FormLabel>
					<ClipboardButtonInput
						className="sftp-card__input"
						id="port"
						name="port"
						value={ SFTP_PORT.toString() }
					/>
					<FormLabel htmlFor="username">{ translate( 'Username' ) }</FormLabel>
					<ClipboardButtonInput
						className="sftp-card__input"
						id="username"
						name="username"
						value={ username }
					/>
					<FormLabel htmlFor="password">{ translate( 'Password' ) }</FormLabel>
					{ renderPasswordField() }
					{ siteHasSshFeature && (
						<FormLabel className="sftp-card__ssh-label" htmlFor="ssh">
							{ translate( 'SSH access' ) }
						</FormLabel>
					) }
					{ siteHasSshFeature && renderSshField() }
					<ReauthRequired twoStepAuthorization={ twoStepAuthorization }>
						{ () => (
							<>
								{ siteHasSshFeature && isSshAccessEnabled && siteId && siteSlug && (
									<SshKeys disabled={ !! disabled } siteId={ siteId } siteSlug={ siteSlug } />
								) }
							</>
						) }
					</ReauthRequired>
				</FormFieldset>
			) }
			{ isLoading && <Spinner /> }
			{ ( hasSftpFeatureAndIsLoading || hasSshFeatureAndIsLoading ) && (
				<SftpCardLoadingPlaceholder />
			) }
		</div>
	);

	let isUntangled = useRemoveDuplicateViewsExperimentEnabled();
	isUntangled = isUntangled && config.isEnabled( 'untangling/settings-i2' );

	let ContainerComponent = HostingCard;
	if ( isUntangled ) {
		ContainerComponent =
			hasSftpFeatureAndIsLoading || hasSshFeatureAndIsLoading
				? SftpCardLoadingPlaceholder
				: React.Fragment;
	}

	let DescriptionComponent = HostingCardDescription;
	if ( isUntangled ) {
		DescriptionComponent = ( { children } ) => {
			const title = useSftpSshSettingTitle();
			return <NavigationHeader title={ title } subtitle={ children } />;
		};
	}

	return (
		<ContainerComponent
			className="sftp-card"
			headingId="sftp-credentials"
			title={
				siteHasSshFeature ? translate( 'SFTP/SSH credentials' ) : translate( 'SFTP credentials' )
			}
		>
			{ ! ( hasSftpFeatureAndIsLoading || hasSshFeatureAndIsLoading ) && (
				<DescriptionComponent>
					{ username
						? translate(
								'Use the credentials below to access and edit your website files using an SFTP client. {{a}}Learn more about SFTP on WordPress.com{{/a}}.',
								{
									components: {
										a: <InlineSupportLink supportContext="hosting-sftp" showIcon={ false } />,
									},
								}
						  )
						: featureExplanation }
				</DescriptionComponent>
			) }
			{ form }
		</ContainerComponent>
	);
};
