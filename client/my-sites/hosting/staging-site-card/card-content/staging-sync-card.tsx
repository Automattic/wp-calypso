import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { urlToSlug } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { SiteSyncStatus } from 'calypso/state/sync/constants';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ConfirmationModal } from '../confirmation-modal';
import SyncOptionsPanel, { CheckboxOptionItem } from '../sync-options-panel';
import { useCheckSyncStatus } from '../use-site-sync-status';
import { StagingSiteSyncLoadingBarCardContent } from './staging-site-sync-loading-bar-card-content';
const stagingSiteSyncSuccess = 'staging-site-sync-success';

const STAGING_SYNC_ERROR_CODES = [
	'staging_site_cannot_sync_staging',
	'staging_site_cannot_sync_production',
];
function useIsPermanentSyncError( error: string | null | undefined ) {
	if ( ! error ) {
		return false;
	}
	return Object.values( STAGING_SYNC_ERROR_CODES ).includes( error );
}

const synchronizationOptions: CheckboxOptionItem[] = [
	{
		name: 'sqls',
		label: 'Site database (SQL)',
		subTitle: translate(
			'Overwrite the database, including any posts, pages, products, or orders.'
		),
		checked: false,
		isDangerous: true,
	},
	{
		name: 'themes',
		label: translate( 'Theme files and directories' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'plugins',
		label: translate( 'Plugin files and directories' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'uploads',
		label: translate( 'Media uploads' ),
		subTitle: translate(
			'You must also select ‘Site database’ for the files to appear in the Media Library.'
		),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'contents',
		label: translate( 'Additional wp-content files and directories' ),
		subTitle: translate( 'Anything other than themes, plugins, and uploads.' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'roots',
		label: translate( 'Additional web root files and directories' ),
		checked: false,
		isDangerous: false,
	},
];

const StagingSyncCardBody = styled.div( {
	display: 'flex',
	'&&&': {
		flexDirection: 'column',
	},
} );

const ConfirmationModalList = styled.ul( {
	marginBottom: '16px',
} );
const ConfirmationModalInputTitle = styled.p( {
	marginBottom: '8px',
} );

const ConfirmationModalInputContainer = styled.div( {
	marginBottom: '26px',
} );

const ConfirmationModalInputSiteSlug = styled.span( {
	color: '#D63638',
} );

const ConfirmationModalContainer = styled.div( {
	display: 'flex',
	flexDirection: 'row',
	'@media screen and (max-width: 768px)': {
		flexDirection: 'column',
		'.button': { flexGrow: 1 },
	},
} );

const StagingSyncCardFooter = styled.p( {
	fontSize: '14px',
	fontStyle: 'italic',
	color: '#646970',
	marginTop: '16px',
	lineHeight: '21px',
	marginBottom: '0px',
	'& a': {
		color: '#646970',
		textDecoration: 'underline',
	},
} );

const SyncContainerTitle = styled.p( {
	fontWeight: 500,
	marginTop: '0px',
	marginBottom: '0px',
} );

const SyncContainerContent = styled.p( {
	fontWeight: 400,
	lineHeight: '24px',
	marginTop: '16px',
	marginBottom: '16px',
} );

const FormRadioContainer = styled.div( {
	marginBottom: '8px',
	marginTop: '8px',
	'@media screen and (max-width: 768px)': {
		display: 'flex',
		flexDirection: 'column',
	},
	'& .form-label': {
		marginBottom: '8px',
	},
} );

const OptionsTreeTitle = styled.p( {
	fontWeight: 500,
	marginTop: '0px',
	marginBottom: '16px',
} );

interface SyncCardProps {
	type: 'production' | 'staging';
	onPull: ( ( items?: string[] ) => void ) | ( () => void );
	onPush: ( ( items?: string[] ) => void ) | ( () => void );
	disabled: boolean;
	productionSiteId: number;
	siteUrls: {
		production: string | null;
		staging: string | null;
	};
	error?: string | null;
}

const StagingToProductionSync = ( {
	disabled,
	siteSlug,
	onSelectItems,
	selectedItems,
	isSyncButtonDisabled,
	isSyncInProgress,
	onConfirm,
	showSyncPanel,
}: {
	disabled: boolean;
	siteSlug: string;
	isSyncInProgress: boolean;
	onSelectItems: ( items: CheckboxOptionItem[] ) => void;
	selectedItems: CheckboxOptionItem[];
	isSyncButtonDisabled: boolean;
	onConfirm: () => void;
	showSyncPanel: boolean;
} ) => {
	const [ typedSiteName, setTypedSiteName ] = useState( '' );
	const translate = useTranslate();
	return (
		<>
			{ showSyncPanel && (
				<>
					<OptionsTreeTitle>{ translate( 'Synchronize this data:' ) }</OptionsTreeTitle>
					<SyncOptionsPanel
						reset={ ! isSyncInProgress }
						items={ synchronizationOptions }
						disabled={ disabled }
						onChange={ onSelectItems }
					></SyncOptionsPanel>
				</>
			) }
			<ConfirmationModalContainer>
				<ConfirmationModal
					disabled={ disabled || isSyncButtonDisabled }
					isConfirmationDisabled={ typedSiteName !== siteSlug }
					isPrimary={ true }
					onConfirm={ onConfirm }
					modalTitle={ translate( 'You’re about to update your production site' ) }
					extraModalContent={
						<div>
							<p>
								{ translate(
									'Synchronizing your production site will overwrite the following items with their equivalents from the staging site:'
								) }
							</p>
							<ConfirmationModalList>
								{ selectedItems.map( ( item ) => {
									return <li key={ item.name }>{ item.label }</li>;
								} ) }
							</ConfirmationModalList>
							<ConfirmationModalInputTitle>
								{ translate( "Enter your site's name {{span}}%(siteSlug)s{{/span}} to confirm.", {
									args: {
										siteSlug: siteSlug as string,
									},
									components: {
										span: <ConfirmationModalInputSiteSlug />,
									},
								} ) }
							</ConfirmationModalInputTitle>
							<ConfirmationModalInputContainer>
								<FormInput
									value={ typedSiteName }
									onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
										setTypedSiteName( event.target.value )
									}
								/>
							</ConfirmationModalInputContainer>
						</div>
					}
					confirmLabel={ translate( 'Synchronize' ) }
					cancelLabel={ translate( 'Cancel' ) }
				>
					<span>{ translate( 'Synchronize' ) }</span>
				</ConfirmationModal>
			</ConfirmationModalContainer>
		</>
	);
};

const ProductionToStagingSync = ( {
	disabled,
	isSyncButtonDisabled,
	onConfirm,
}: {
	disabled: boolean;
	isSyncButtonDisabled: boolean;
	onConfirm: () => void;
} ) => {
	return (
		<ConfirmationModalContainer>
			<ConfirmationModal
				disabled={ disabled || isSyncButtonDisabled }
				isPrimary={ true }
				onConfirm={ onConfirm }
				modalTitle={ translate( 'You are about to update your staging site' ) }
				modalMessage={ translate(
					'Synchronizing your staging site will replace the contents of the staging site with those of your production site.'
				) }
				confirmLabel={ translate( 'Synchronize' ) }
				cancelLabel={ translate( 'Cancel' ) }
			>
				<span>{ translate( 'Synchronize' ) }</span>
			</ConfirmationModal>
		</ConfirmationModalContainer>
	);
};

const SyncCardContainer = ( {
	children,
	currentSiteType,
	progress,
	isSyncInProgress,
	siteToSync,
	siteUrls,
	onRetry,
	error,
}: {
	children: React.ReactNode;
	currentSiteType: 'production' | 'staging';
	progress: number;
	isSyncInProgress: boolean;
	siteToSync: 'production' | 'staging' | null;
	siteUrls: SyncCardProps[ 'siteUrls' ];
	error?: string | null;
	onRetry?: () => void;
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isStagingSyncError = useIsPermanentSyncError( error ) && siteToSync;

	return (
		<StagingSyncCardBody>
			<SyncContainerTitle>{ translate( 'Database and file synchronization' ) }</SyncContainerTitle>

			{ ! isSyncInProgress && (
				<>
					<SyncContainerContent>
						{ currentSiteType === 'production'
							? translate(
									'Pull changes from your staging site into production, or refresh staging with the current production data.'
							  )
							: translate(
									'Refresh your staging site with the latest from production, or push changes in your staging site to production.'
							  ) }
					</SyncContainerContent>
					{ error && isStagingSyncError && (
						<Notice
							status="is-error"
							icon="mention"
							showDismiss={ false }
							text={ translate(
								'We couldn’t connect to the %(siteType)s site: {{br/}} %(siteUrl)s',
								{
									args: {
										siteType: siteToSync,
										siteUrl: siteUrls[ siteToSync ]
											? urlToSlug( siteUrls[ siteToSync ] as string )
											: '',
									},
									components: {
										br: <br />,
									},
								}
							) }
						>
							<NoticeAction href="/help">{ translate( 'Contact support' ) }</NoticeAction>
						</Notice>
					) }
					{ error && ! isStagingSyncError && (
						<Notice
							status="is-error"
							icon="mention"
							showDismiss={ false }
							text={ translate( 'We couldn’t synchronize the %s environment.', {
								args: [ siteToSync ?? '' ],
							} ) }
						>
							<NoticeAction onClick={ () => onRetry?.() }>
								{ translate( 'Try Again' ) }
							</NoticeAction>
						</Notice>
					) }
					{ ! error && (
						<>
							<SyncContainerTitle>
								{ translate( 'Choose synchronization direction:' ) }
							</SyncContainerTitle>
							{ children }
							<StagingSyncCardFooter>
								{ translate(
									"We'll automatically back up your site before synchronization starts. Need to restore a backup? Head to the {{link}}Activity Log{{/link}}.",
									{
										components: {
											link: <a href={ `/activity-log/${ siteSlug }` } />,
										},
									}
								) }
							</StagingSyncCardFooter>
						</>
					) }
				</>
			) }
			{ isSyncInProgress && (
				<StagingSiteSyncLoadingBarCardContent siteToSync={ siteToSync } progress={ progress } />
			) }
		</StagingSyncCardBody>
	);
};

export const SiteSyncCard = ( {
	type,
	onPush,
	onPull,
	disabled,
	productionSiteId,
	siteUrls,
	error,
}: SyncCardProps ) => {
	const dispatch = useDispatch();
	const actionForType = useMemo( () => ( type === 'production' ? 'pull' : 'push' ), [ type ] );
	const [ selectedItems, setSelectedItems ] = useState< CheckboxOptionItem[] >(
		[] as CheckboxOptionItem[]
	);
	const [ selectedOption, setSelectedOption ] = useState< string | null >( null );
	const siteSlug = useSelector(
		type === 'staging' ? ( state ) => getSiteSlug( state, productionSiteId ) : getSelectedSiteSlug
	);
	const {
		progress,
		resetSyncStatus,
		isSyncInProgress,
		error: checkStatusError,
		status,
		targetSite,
	} = useCheckSyncStatus( productionSiteId );

	const transformSelectedItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		return (
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as CheckboxOptionItem[] )
		);
	}, [] );

	const onPushInternal = useCallback( () => {
		resetSyncStatus();
		dispatch( removeNotice( stagingSiteSyncSuccess ) );
		if ( type === 'production' ) {
			onPush?.();
		}
		if ( type === 'staging' ) {
			onPush?.( transformSelectedItems( selectedItems ) );
		}
	}, [ dispatch, onPush, resetSyncStatus, selectedItems, transformSelectedItems, type ] );

	const syncError = error || checkStatusError;
	const onPullInternal = useCallback( () => {
		resetSyncStatus();
		dispatch( removeNotice( stagingSiteSyncSuccess ) );
		if ( type === 'production' ) {
			onPull?.( transformSelectedItems( selectedItems ) );
		}
		if ( type === 'staging' ) {
			onPull?.();
		}
	}, [ resetSyncStatus, dispatch, type, onPull, transformSelectedItems, selectedItems ] );

	const isSyncButtonDisabled =
		disabled ||
		( selectedItems.length === 0 && selectedOption === actionForType ) ||
		selectedOption === null;

	let siteToSync: 'production' | 'staging' | null = null;
	if ( targetSite ) {
		siteToSync = targetSite;
	} else {
		siteToSync = selectedOption === actionForType ? 'production' : 'staging';
	}

	useEffect( () => {
		if ( selectedOption && status === SiteSyncStatus.COMPLETED && ! syncError ) {
			dispatch(
				successNotice( translate( 'Site synchronized successfully.' ), {
					id: stagingSiteSyncSuccess,
				} )
			);
			setSelectedOption( null );
			setSelectedItems( [] );
		}
	}, [ dispatch, selectedOption, status, syncError ] );

	return (
		<SyncCardContainer
			currentSiteType={ type }
			siteToSync={ siteToSync }
			progress={ progress }
			isSyncInProgress={ isSyncInProgress }
			error={ syncError }
			siteUrls={ siteUrls }
			onRetry={ () => {
				if ( selectedOption === 'push' ) {
					onPushInternal();
				}
				if ( selectedOption === 'pull' ) {
					onPullInternal();
				}
			} }
		>
			<FormRadioContainer>
				<FormLabel>
					<FormRadio
						className="staging-site-sync-card__radio"
						label={
							type === 'production'
								? translate( 'Staging into production' )
								: translate( 'Production into staging' )
						}
						value="pull"
						checked={ selectedOption === 'pull' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setSelectedOption( event.target.value )
						}
					/>
				</FormLabel>
				<FormLabel>
					<FormRadio
						className="staging-site-sync-card__radio"
						label={
							type === 'production'
								? translate( 'Production to staging' )
								: translate( 'Staging to production' )
						}
						value="push"
						checked={ selectedOption === 'push' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setSelectedOption( event.target.value )
						}
					/>
				</FormLabel>
			</FormRadioContainer>
			{ selectedOption === actionForType && (
				<StagingToProductionSync
					showSyncPanel={ selectedOption === actionForType }
					siteSlug={ siteSlug || '' }
					isSyncInProgress={ isSyncInProgress }
					disabled={ disabled }
					onSelectItems={ setSelectedItems }
					selectedItems={ selectedItems }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ selectedOption === 'push' ? onPushInternal : onPullInternal }
				/>
			) }
			{ selectedOption !== actionForType && (
				<ProductionToStagingSync
					disabled={ disabled }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ selectedOption === 'push' ? onPushInternal : onPullInternal }
				/>
			) }
		</SyncCardContainer>
	);
};
