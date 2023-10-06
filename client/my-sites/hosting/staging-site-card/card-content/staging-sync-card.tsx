import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ConfirmationModal } from '../confirmation-modal';
import SyncOptionsPanel, { CheckboxOptionItem } from '../sync-options-panel';
import { useCheckSyncStatus } from '../use-site-sync-status';
import { StagingSiteSyncLoadingBarCardContent } from './staging-site-sync-loading-bar-card-content';

const synchronizationOptions: CheckboxOptionItem[] = [
	{
		name: 'sqls',
		label: 'Site Database (SQL)',
		subTitle: translate(
			'Overwrite the database, including any posts, pages, products, or orders.'
		),
		checked: false,
		isDangerous: true,
	},
	{
		name: 'themes',
		label: translate( 'Themes' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'plugins',
		label: translate( 'Plugins' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'uploads',
		label: translate( 'Media Uploads' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'contents',
		label: translate( 'wp-content Directory' ),
		subTitle: translate(
			'Everything in the wp-content directory, excluding themes, plugins, and uploads'
		),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'roots',
		label: translate( 'Web Root' ),
		subTitle: translate( 'Everything in the WordPress root, including any non WordPress files' ),
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

interface StagingCardProps {
	onPull: () => void;
	onPush: ( items?: string[] ) => void;
	disabled: boolean;
	productionSiteId: number;
	stagingSiteId?: number;
	error?: string | null;
}

interface ProductionCardProps {
	onPull: ( items?: string[] ) => void;
	onPush: () => void;
	disabled: boolean;
	productionSiteId: number;
	stagingSiteId?: number;
	error?: string | null;
}

const StagingToProductionSync = ( {
	disabled,
	siteSlug,
	onSelectItems,
	selectedItems,
	isSyncButtonDisabled,
	onConfirm,
}: {
	disabled: boolean;
	siteSlug: string;
	onSelectItems: ( items: CheckboxOptionItem[] ) => void;
	selectedItems: CheckboxOptionItem[];
	isSyncButtonDisabled: boolean;
	onConfirm: () => void;
} ) => {
	const [ typedSiteName, setTypedSiteName ] = useState( '' );
	const translate = useTranslate();
	return (
		<>
			<OptionsTreeTitle>{ translate( 'Synchronize the following:' ) }</OptionsTreeTitle>
			<SyncOptionsPanel
				items={ synchronizationOptions }
				disabled={ disabled }
				onChange={ onSelectItems }
			></SyncOptionsPanel>
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
	progress,
	isSyncInProgress,
	siteToSync,
	onRetry,
	error,
}: {
	children: React.ReactNode;
	progress: number;
	isSyncInProgress: boolean;
	siteToSync: 'production' | 'staging';
	error?: string | null;
	onRetry?: () => void;
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<StagingSyncCardBody>
			<SyncContainerTitle>{ translate( 'Data and File synchronization' ) }</SyncContainerTitle>

			{ ! isSyncInProgress && (
				<>
					<SyncContainerContent>
						{ translate(
							'Sync your database and files between your staging and production environments—in either direction.'
						) }
					</SyncContainerContent>
					{ error && (
						<Notice
							status="is-error"
							icon="mention"
							showDismiss={ false }
							text={ translate( 'We couldn’t synchronize the %s environment.', {
								args: [ siteToSync ],
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
								{ translate( 'Choose synchronization direction' ) }
							</SyncContainerTitle>
							{ children }
							<StagingSyncCardFooter>
								{ translate(
									"We'll automatically back up your site before synchronization starts. Need to restore a backup? Head to the {{link}}Activity Log.{{/link}}",
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

export const StagingSiteSyncCard = ( {
	productionSiteId,
	onPush,
	onPull,
	disabled,
	error,
}: StagingCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] as CheckboxOptionItem[] );
	const [ selectedOption, setSelectedOption ] = useState< string | null >( null );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, productionSiteId ) );
	const {
		progress,
		resetSyncStatus,
		isSyncInProgress,
		error: checkStatusError,
	} = useCheckSyncStatus( productionSiteId );

	const transformSelectedItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		return (
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as string[] )
		);
	}, [] );

	const onPushInternal = useCallback( () => {
		resetSyncStatus();
		onPush?.( transformSelectedItems( selectedItems ) );
	}, [ onPush, selectedItems, resetSyncStatus, transformSelectedItems ] );

	const onPullInternal = useCallback( () => {
		resetSyncStatus();
		onPull?.();
	}, [ onPull, resetSyncStatus ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'push' );
	const syncError = error || checkStatusError;

	return (
		<SyncCardContainer
			siteToSync={ selectedOption === 'push' ? 'production' : 'staging' }
			isSyncInProgress={ isSyncInProgress }
			progress={ progress }
			error={ syncError }
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
						label={ translate( 'Push to production' ) }
						value="push"
						checked={ selectedOption === 'push' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setSelectedOption( event.target.value )
						}
					/>
				</FormLabel>
				<FormLabel>
					<FormRadio
						className="staging-site-sync-card__radio"
						label={ translate( 'Pull from production' ) }
						value="pull"
						checked={ selectedOption === 'pull' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setSelectedOption( event.target.value )
						}
					/>
				</FormLabel>
			</FormRadioContainer>
			{ selectedOption === 'push' && (
				<StagingToProductionSync
					siteSlug={ siteSlug || '' }
					disabled={ disabled }
					onSelectItems={ setSelectedItems }
					selectedItems={ selectedItems }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ onPushInternal }
				/>
			) }
			{ selectedOption === 'pull' && (
				<ProductionToStagingSync
					disabled={ disabled }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ onPullInternal }
				/>
			) }
		</SyncCardContainer>
	);
};

export const ProductionSiteSyncCard = ( {
	onPush,
	onPull,
	disabled,
	productionSiteId,
	error,
}: ProductionCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState< CheckboxOptionItem[] >(
		[] as CheckboxOptionItem[]
	);
	const [ selectedOption, setSelectedOption ] = useState< string | null >( null );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const {
		progress,
		resetSyncStatus,
		isSyncInProgress,
		error: checkStatusError,
	} = useCheckSyncStatus( productionSiteId );

	const onPushInternal = useCallback( () => {
		resetSyncStatus();
		onPush?.();
	}, [ onPush, resetSyncStatus ] );
	const syncError = error || checkStatusError;

	const transformSelectedItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		return (
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as CheckboxOptionItem[] )
		);
	}, [] );

	const onPullInternal = useCallback( () => {
		resetSyncStatus();
		onPull?.( transformSelectedItems( selectedItems ) );
	}, [ onPull, selectedItems, resetSyncStatus, transformSelectedItems ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'pull' );

	return (
		<SyncCardContainer
			siteToSync={ selectedOption === 'pull' ? 'production' : 'staging' }
			progress={ progress }
			isSyncInProgress={ isSyncInProgress }
			error={ syncError }
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
						label={ translate( 'Pull from staging' ) }
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
						label={ translate( 'Push to staging' ) }
						value="push"
						checked={ selectedOption === 'push' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setSelectedOption( event.target.value )
						}
					/>
				</FormLabel>
			</FormRadioContainer>
			{ selectedOption === 'pull' && (
				<StagingToProductionSync
					siteSlug={ siteSlug || '' }
					disabled={ disabled }
					onSelectItems={ setSelectedItems }
					selectedItems={ selectedItems }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ onPullInternal }
				/>
			) }
			{ selectedOption === 'push' && (
				<ProductionToStagingSync
					disabled={ disabled }
					isSyncButtonDisabled={ isSyncButtonDisabled }
					onConfirm={ onPushInternal }
				/>
			) }
		</SyncCardContainer>
	);
};
