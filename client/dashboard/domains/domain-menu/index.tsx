import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router';
import ResponsiveMenu from '../../components/responsive-menu';

const DomainMenu = ( { domainName }: { domainName: string } ) => {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu label={ __( 'Domain Menu' ) }>
			<ResponsiveMenu.Item to={ `/domains/${ domainName }` } activeOptions={ { exact: true } }>
				{ __( 'Overview' ) }
			</ResponsiveMenu.Item>
			{ supports.emails && (
				<ResponsiveMenu.Item to={ emailsRoute.fullPath }>{ __( 'Emails' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default DomainMenu;
