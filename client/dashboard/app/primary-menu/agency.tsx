import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';
import { useA4AContextQuery } from '../../data/agency/use-a4a-context-query';
import { useAuth } from '../auth';

export default function AgencyMenu() {
	const { user } = useAuth();
	const { data: a4aContext } = useA4AContextQuery( Boolean( user ) );

	const isClientUser = a4aContext?.isClientUser;

	return (
		<ResponsiveMenu>
			{ isClientUser ? (
				<ResponsiveMenu.Item to="/client/subscriptions">
					{ __( 'Subscriptions' ) }
				</ResponsiveMenu.Item>
			) : (
				<ResponsiveMenu.Item to="/overview">{ __( 'Overview' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
}
