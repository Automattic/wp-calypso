import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { Link, useLocation } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

export default function SettingsPageHeader( props: PageHeaderProps ) {
	const location = useLocation();
	const { siteSlug } = siteRoute.useParams();
	const { title, ...otherProps } = props;

	const breadcrumbs = (
		<Breadcrumbs
			items={ [
				{
					label: __( 'Settings' ),
					href: `/sites/${ siteSlug }/settings`,
				},
				{
					label: title,
					href: location.pathname,
				},
			] }
			renderItemLink={ ( { href, label, ...rest } ) => (
				<Link to={ href } { ...rest }>
					{ label }
				</Link>
			) }
		/>
	);
	return <PageHeader title={ title } breadcrumbs={ breadcrumbs } { ...otherProps } />;
}
