import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ButtonGroup from 'calypso/components/button-group';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { PluginComponentProps } from './types';
import UpdatePlugins from './update-plugins';
import './style.scss';

type Props = {
	isLoading?: boolean;
	showUpdatePlugins?: boolean;
	plugins: PluginComponentProps[];
	onClickEditAll: () => void;
};
const BulkActionsHeader: ( props: Props ) => JSX.Element = ( {
	isLoading = false,
	showUpdatePlugins = false,
	plugins,
	onClickEditAll,
} ) => {
	const translate = useTranslate();

	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	return (
		<div className="plugin-common-table__bulk-actions">
			{ showUpdatePlugins && <UpdatePlugins plugins={ plugins } /> }
			<ButtonGroup className="plugin-management-v2__table-button-group">
				<Button compact onClick={ onClickEditAll }>
					{ translate( 'Edit All', { context: 'button label' } ) }
				</Button>
			</ButtonGroup>
		</div>
	);
};

export default BulkActionsHeader;
