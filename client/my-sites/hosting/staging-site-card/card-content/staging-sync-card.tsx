import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import FormInput from 'calypso/components/forms/form-text-input';
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
			'Overwrite the database, including any posts, pages, products, or orders with staging data.'
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
		subTitle: translate( 'excluding themes, plugins, and uploads' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'roots',
		label: translate( 'Web Root' ),
		subTitle: translate(
			'Everything in the wp-content directory, includes wp-config php and any non WordPress files'
		),
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

const FormSelectContainer = styled.div( {
	marginBottom: '16px',
	marginTop: '8px',
	'@media screen and (max-width: 768px)': {
		display: 'flex',
		flexDirection: 'column',
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
}

interface ProductionCardProps {
	onPull: ( items?: string[] ) => void;
	onPush: () => void;
	disabled: boolean;
	productionSiteId: number;
	stagingSiteId?: number;
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
	selectedItems: string[];
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
									return <li key={ item }>{ item }</li>;
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
}: {
	children: React.ReactNode;
	progress: number;
	isSyncInProgress: boolean;
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
							'Keep your database and files synchronized between the production and staging environments.'
						) }
					</SyncContainerContent>
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
			{ isSyncInProgress && <StagingSiteSyncLoadingBarCardContent progress={ progress } /> }
		</StagingSyncCardBody>
	);
};

export const StagingSiteSyncCard = ( {
	productionSiteId,
	onPush,
	onPull,
	disabled,
}: StagingCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] as string[] );
	const [ selectedOption, setSelectedOption ] = useState( 'push' );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, productionSiteId ) );
	const { progress, resetSyncStatus, isSyncInProgress } = useCheckSyncStatus( productionSiteId );

	const onSelectItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		const itemNames =
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as string[] );

		setSelectedItems( itemNames );
	}, [] );

	const onPushInternal = useCallback( () => {
		resetSyncStatus();
		onPush?.( selectedItems );
	}, [ onPush, selectedItems, resetSyncStatus ] );

	const onPullInternal = useCallback( () => {
		resetSyncStatus();
		onPull?.();
	}, [ onPull, resetSyncStatus ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'push' );

	return (
		<SyncCardContainer isSyncInProgress={ isSyncInProgress } progress={ progress }>
			<FormSelectContainer>
				<FormSelect
					value={ selectedOption }
					onChange={ ( { currentTarget } ) => setSelectedOption( currentTarget.value ) }
				>
					<option key={ 0 } value="push">
						{ translate( 'Push staging changes to production' ) }
					</option>
					<option key={ 1 } value="pull">
						{ translate( 'Pull production changes to staging' ) }
					</option>
				</FormSelect>
			</FormSelectContainer>
			{ selectedOption === 'push' && (
				<StagingToProductionSync
					siteSlug={ siteSlug || '' }
					disabled={ disabled }
					onSelectItems={ onSelectItems }
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
}: ProductionCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState< string[] >( [] as string[] );
	const [ selectedOption, setSelectedOption ] = useState( 'pull' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const { progress, resetSyncStatus, isSyncInProgress } = useCheckSyncStatus( productionSiteId );

	const onPushInternal = useCallback( () => {
		resetSyncStatus();
		onPush?.();
	}, [ onPush, resetSyncStatus ] );

	const onSelectItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		const itemNames =
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as string[] );

		setSelectedItems( itemNames );
	}, [] );

	const onPullInternal = useCallback( () => {
		resetSyncStatus();
		onPull?.( selectedItems );
	}, [ onPull, selectedItems, resetSyncStatus ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'pull' );

	return (
		<SyncCardContainer progress={ progress } isSyncInProgress={ isSyncInProgress }>
			<FormSelectContainer>
				<FormSelect
					value={ selectedOption }
					onChange={ ( { currentTarget } ) => setSelectedOption( currentTarget.value ) }
				>
					<option key={ 0 } value="pull">
						{ translate( 'Pull staging changes to production' ) }
					</option>
					<option key={ 1 } value="push">
						{ translate( 'Push production changes to staging' ) }
					</option>
				</FormSelect>
			</FormSelectContainer>
			{ selectedOption === 'pull' && (
				<StagingToProductionSync
					siteSlug={ siteSlug || '' }
					disabled={ disabled }
					onSelectItems={ onSelectItems }
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
