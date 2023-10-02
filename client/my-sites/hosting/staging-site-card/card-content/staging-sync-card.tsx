import styled from '@emotion/styled';
import { translate, useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ConfirmationModal } from '../confirmation-modal';
import CheckboxTree, { CheckboxTreeItem } from './checkbox-tree';

const synchronizationOptions: CheckboxTreeItem[] = [
	{
		name: 'sqls',
		label: 'Database',
	},
	{
		label: 'Files',
		children: [
			{
				name: 'themes',
				label: translate( 'Themes' ),
			},
			{
				name: 'plugins',
				label: translate( 'Plugins' ),
			},
			{
				name: 'uploads',
				label: translate( 'Media Uploads' ),
			},
			{
				name: 'contents',
				label: translate( 'wp-content directory' ),
				subTitle: translate( 'excluding themes, plugins, and uploads' ),
			},
			{
				name: 'roots',
				label: translate( 'WordPress roots' ),
				subTitle: translate( 'includes wp-config php and any non WordPress files' ),
			},
		],
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
	marginTop: '12px',
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
} );

interface CardProps {
	onPush: ( items?: string[] ) => void;
	onPull: ( items?: string[] ) => void;
	disabled: boolean;
}

const ProductionSiteSync = ( {
	onPush,
	onPull,
	disabled,
	onSelectItems,
	selectedOption,
	onOptionChange,
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
					<CheckboxTree
						disabled={ disabled }
						treeItems={ synchronizationOptions }
						onChange={ onSelectItems }
					></CheckboxTree>
					<ConfirmationModalContainer>
						<ConfirmationModal
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
	onSelectItems,
	selectedOption,
	onOptionChange,
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
					<CheckboxTree
						disabled={ disabled }
						treeItems={ synchronizationOptions }
						onChange={ onSelectItems }
					></CheckboxTree>
					<ConfirmationModalContainer>
						<ConfirmationModal
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

export const ProductionSiteSyncCard = ( { onPush, onPull, disabled }: CardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] as CheckboxTreeItem[] );
	const [ selectedOption, setSelectedOption ] = useState( 'push' );
	const onPushInternal = useCallback( () => {
		const items =
			selectedItems.flatMap( ( item ) => {
				if ( item?.children?.length || 0 > 0 ) {
					return item?.children?.map( ( child ) => child.name || '' ) || [];
				}
				if ( item?.name ) {
					return item.name || '';
				}
				return [];
			} ) || [];
		onPush?.( items );
	}, [ onPush, selectedItems ] );

	const onPullInternal = useCallback( () => {
		onPull?.();
	}, [ onPull ] );
	return (
		<SyncCardContainer>
			<ProductionSiteSync
				selectedOption={ selectedOption }
				onOptionChange={ setSelectedOption }
				onPush={ onPushInternal }
				onPull={ onPullInternal }
				disabled={ disabled }
				onSelectItems={ setSelectedItems }
			/>
		</SyncCardContainer>
	);
};

export const StagingSiteSyncCard = ( { onPush, onPull, disabled }: CardProps ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] as CheckboxTreeItem[] );
	const [ selectedOption, setSelectedOption ] = useState( 'pull' );
	const onPushInternal = useCallback( () => {
		onPush?.();
	}, [ onPush ] );
	const onPullInternal = useCallback( () => {
		const items =
			selectedItems.flatMap( ( item ) => {
				if ( item?.children?.length || 0 > 0 ) {
					return item?.children?.map( ( child ) => child.name || '' ) || [];
				}
				if ( item?.name ) {
					return item.name || '';
				}
				return [];
			} ) || [];
		onPull?.( items );
	}, [ onPull, selectedItems ] );
	return (
		<SyncCardContainer>
			<StagingSiteSync
				selectedOption={ selectedOption }
				onOptionChange={ setSelectedOption }
				onPush={ onPushInternal }
				onPull={ onPullInternal }
				disabled={ disabled }
				onSelectItems={ setSelectedItems }
			/>
		</SyncCardContainer>
	);
};
