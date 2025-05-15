import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router';

export default function SettingsBreadcrumbs() {
	const { siteSlug } = siteRoute.useParams();

	return (
		<Breadcrumbs
			items={ [
				{
					label: __( 'Settings' ),
					href: `/sites/${ siteSlug }/settings`,
				},
				{
					label: '#',
					href: '#',
				},
			] }
			renderItemLink={ ( { href, label, ...rest } ) => (
				<Link to={ href } { ...rest }>
					{ label }
				</Link>
			) }
		/>
	);
}
