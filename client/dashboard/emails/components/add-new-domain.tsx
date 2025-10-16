import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	FlexBlock,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, plus } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { domainsRoute } from '../../app/router/domains';
import './add-new-domain.css';

export type AddNewDomainOrigin = 'choose-domain' | 'add-forwarder' | 'emails';

type Props = {
	origin?: AddNewDomainOrigin;
};

export default function AddNewDomain( { origin = 'emails' }: Props ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	return (
		<ItemGroup className="add-new-domain__itemlist" isBordered isSeparated>
			<Item
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_emails_add_new_domain_click', {
						origin,
					} );
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
