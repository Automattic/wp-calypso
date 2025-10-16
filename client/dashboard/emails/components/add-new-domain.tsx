import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	FlexBlock,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, plus } from '@wordpress/icons';
import { domainsRoute } from '../../app/router/domains';
import './add-new-domain.css';

export default function AddNewDomain() {
	const navigate = useNavigate();

	return (
		<ItemGroup className="add-new-domain__itemlist" isBordered isSeparated>
			<Item
				onClick={ () => {
					navigate( { to: domainsRoute.fullPath } );
				} }
			>
				<HStack justify="flex-start">
					<FlexBlock>{ __( 'Add a new domain' ) }</FlexBlock>
					<Icon className="add-new-domain__icon" icon={ plus } />
				</HStack>
			</Item>
		</ItemGroup>
	);
}
