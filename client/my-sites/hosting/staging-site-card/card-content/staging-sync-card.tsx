import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
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

const ProductionSiteSync = ( {
	onPush,
	onPull,
	disabled,
	isButtonDisabled,
	onSelectItems,
	selectedOption,
	onOptionChange,
}: {
	onPush: ( items?: string[] ) => void;
	onPull: () => void;
	disabled: boolean;
	isButtonDisabled: boolean;
	onSelectItems: ( items: CheckboxOptionItem[] ) => void;
	selectedOption: string;
	onOptionChange: ( option: string ) => void;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<FormSelectContainer>
				<FormSelect
					value={ selectedOption }
					onChange={ ( { currentTarget } ) => onOptionChange( currentTarget.value ) }
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
				<>
					<OptionsTreeTitle>{ translate( 'Synchronize the following:' ) }</OptionsTreeTitle>
					<SyncOptionsPanel
						items={ synchronizationOptions }
						disabled={ disabled }
						onChange={ onSelectItems }
					></SyncOptionsPanel>
					<ConfirmationModalContainer>
						<ConfirmationModal
							disabled={ disabled || isButtonDisabled }
							isPrimary={ true }
							onConfirm={ onPush }
							modalTitle={ translate( 'Confirm pushing changes to your production site.' ) }
							modalMessage={ translate(
								'Are you sure you want to push your changes to your production site?'
							) }
							confirmLabel={ translate( 'Push to production' ) }
							cancelLabel={ translate( 'Cancel' ) }
						>
							<span>{ translate( 'Synchronize' ) }</span>
						</ConfirmationModal>
					</ConfirmationModalContainer>
				</>
			) }
			{ selectedOption === 'pull' && (
				<ConfirmationModalContainer>
					<ConfirmationModal
						disabled={ disabled || isButtonDisabled }
						isPrimary={ true }
						onConfirm={ onPull }
						modalTitle={ translate( 'Confirm pulling changes from your production site.' ) }
						modalMessage={ translate(
							'Are you sure you want to pull your changes from your production site?'
						) }
						confirmLabel={ translate( 'Pull from production' ) }
						cancelLabel={ translate( 'Cancel' ) }
					>
						<span>{ translate( 'Synchronize' ) }</span>
					</ConfirmationModal>
				</ConfirmationModalContainer>
			) }
		</>
	);
};

const StagingSiteSync = ( {
	onPush,
	onPull,
	disabled,
	isButtonDisabled,
	onSelectItems,
	selectedOption,
	onOptionChange,
}: {
	onPush: () => void;
	onPull: ( items?: string[] ) => void;
	disabled: boolean;
	isButtonDisabled: boolean;
	onSelectItems: ( items: CheckboxOptionItem[] ) => void;
	selectedOption: string;
	onOptionChange: ( option: string ) => void;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<FormSelectContainer>
				<FormSelect
					value={ selectedOption }
					onChange={ ( { currentTarget } ) => onOptionChange( currentTarget.value ) }
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
				<>
					<OptionsTreeTitle>{ translate( 'Synchronize the following:' ) }</OptionsTreeTitle>
					<SyncOptionsPanel
						items={ synchronizationOptions }
						disabled={ disabled }
						onChange={ onSelectItems }
					></SyncOptionsPanel>
					<ConfirmationModalContainer>
						<ConfirmationModal
							disabled={ disabled || isButtonDisabled }
							isPrimary={ true }
							onConfirm={ onPull }
							modalTitle={ translate( 'Confirm pull your changes from your staging site' ) }
							modalMessage={ translate(
								'Are you sure you want to pull your changes from your staging site?'
							) }
							confirmLabel={ translate( 'Pull from staging' ) }
							cancelLabel={ translate( 'Cancel' ) }
						>
							<span>{ translate( 'Synchronize' ) }</span>
						</ConfirmationModal>
					</ConfirmationModalContainer>
				</>
			) }
			{ selectedOption === 'push' && (
				<ConfirmationModalContainer>
					<ConfirmationModal
						disabled={ disabled || isButtonDisabled }
						isPrimary={ true }
						onConfirm={ onPush }
						modalTitle={ translate( 'Confirm pushing changes to your staging site' ) }
						modalMessage={ translate(
							'Are you sure you want to push your changes to your staging site?'
						) }
						confirmLabel={ translate( 'Push to staging' ) }
						cancelLabel={ translate( 'Cancel' ) }
					>
						<span>{ translate( 'Synchronize' ) }</span>
					</ConfirmationModal>
				</ConfirmationModalContainer>
			) }
		</>
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
	const isDisabled = disabled || ( selectedItems.length === 0 && selectedOption === 'push' );
	return (
		<SyncCardContainer>
			<ProductionSiteSync
				selectedOption={ selectedOption }
				onOptionChange={ setSelectedOption }
				onPush={ onPushInternal }
				onPull={ onPullInternal }
				disabled={ disabled }
				isButtonDisabled={ isDisabled }
				onSelectItems={ onSelectItems }
			/>
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

	const isButtonDisabled = disabled || ( selectedItems.length === 0 && selectedOption === 'pull' );
	return (
		<SyncCardContainer>
			<StagingSiteSync
				selectedOption={ selectedOption }
				onOptionChange={ setSelectedOption }
				onPush={ onPushInternal }
				onPull={ onPullInternal }
				disabled={ disabled }
				isButtonDisabled={ isButtonDisabled }
				onSelectItems={ onSelectItems }
			/>
		</SyncCardContainer>
	);
};
