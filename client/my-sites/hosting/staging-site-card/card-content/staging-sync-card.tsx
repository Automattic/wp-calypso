import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import FormInput from 'calypso/components/forms/form-text-input';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ConfirmationModal } from '../confirmation-modal';
import SyncOptionsPanel, { CheckboxOptionItem } from '../sync-options-panel';

const synchronizationOptions: CheckboxOptionItem[] = [
	{
		name: 'sqls',
		label: 'Site Database (SQL)',
		subTitle: translate(
			'Overwrite the database, posts, pages, products, and orders with staging data.'
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
		label: translate( 'wp-content directory' ),
		subTitle: translate( 'excluding themes, plugins, and uploads' ),
		checked: false,
		isDangerous: false,
	},
	{
		name: 'roots',
		label: translate( 'WordPress roots' ),
		subTitle: translate( 'includes wp-config php and any non WordPress files' ),
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
	onPush: ( items?: string[] ) => void;
	onPull: ( items?: string[] ) => void;
	disabled: boolean;
}

interface ProductionCardProps {
	onPush: ( items?: string[] ) => void;
	onPull: () => void;
	disabled: boolean;
}

const StagingToProductionSync = ( {
	disabled,
	onSelectItems,
	selectedItems,
	isSyncButtonDisabled,
	onConfirm,
}: {
	disabled: boolean;
	onSelectItems: ( items: CheckboxOptionItem[] ) => void;
	selectedItems: string[];
	isSyncButtonDisabled: boolean;
	onConfirm: () => void;
} ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
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
							<ul>
								{ selectedItems.map( ( item ) => {
									return <li key={ item }>{ item }</li>;
								} ) }
							</ul>
							<p>
								{ translate( "Enter your site's name {{span}}%(siteSlug)s{{/span}} to confirm.", {
									args: {
										siteSlug: siteSlug as string,
									},
									components: {
										span: <span />,
									},
								} ) }
							</p>
							<FormInput
								value={ typedSiteName }
								onChange={ ( event: ChangeEvent ) => setTypedSiteName( event.target.value ) }
							/>
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

const SyncCardContainer = ( { children } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	return (
		<StagingSyncCardBody>
			<SyncContainerTitle>{ translate( 'Data and File synchronization' ) }</SyncContainerTitle>
			<SyncContainerContent>
				{ translate(
					'Keep your database and files synchronized between the production and staging environments.'
				) }
			</SyncContainerContent>
			<SyncContainerTitle>{ translate( 'Choose synchronization direction' ) }</SyncContainerTitle>
			{ children }
			<StagingSyncCardFooter>
				{ translate(
					"We'll automatically back up your site before synchronization starts. Need to restore a backup? Head to the {{link}}Activity Log.{{/link}}",
					{
						components: {
							link: (
								<a
									href={ `/activity-log/${ siteSlug }` }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</StagingSyncCardFooter>
		</StagingSyncCardBody>
	);
};

export const ProductionSiteSyncCard = ( { onPush, onPull, disabled }: ProductionCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] as string[] );
	const [ selectedOption, setSelectedOption ] = useState( 'push' );

	const onSelectItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		const itemNames =
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as string[] );

		setSelectedItems( itemNames );
	}, [] );

	const onPushInternal = useCallback( () => {
		onPush?.( selectedItems );
	}, [ onPush, selectedItems ] );

	const onPullInternal = useCallback( () => {
		onPull?.();
	}, [ onPull ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'push' );

	return (
		<SyncCardContainer>
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

export const StagingSiteSyncCard = ( { onPush, onPull, disabled }: StagingCardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState< string[] >( [] as string[] );
	const [ selectedOption, setSelectedOption ] = useState( 'pull' );

	const onPushInternal = useCallback( () => {
		onPush?.();
	}, [ onPush ] );

	const onSelectItems = useCallback( ( items: CheckboxOptionItem[] ) => {
		const itemNames =
			items.map( ( item ) => {
				return item.name;
			} ) || ( [] as string[] );

		setSelectedItems( itemNames );
	}, [] );

	const onPullInternal = useCallback( () => {
		onPull?.( selectedItems );
	}, [ onPull, selectedItems ] );

	const isSyncButtonDisabled =
		disabled || ( selectedItems.length === 0 && selectedOption === 'pull' );

	return (
		<SyncCardContainer>
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
