import { siteBySlugQuery, siteWordPressVersionQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canViewWordPressSettings } from '../features';
import { VersionForm } from './version-form';

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const canView = canViewWordPressSettings( site );

	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: canView,
	} );

	if ( ! canView ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title="WordPress"
						description={ __( 'Manage your WordPress version.' ) }
					/>
				}
			>
				<Notice>
					<VStack>
						<Text as="p">
							{ sprintf(
								// translators: %s: WordPress version, e.g. 6.8
								__( 'Every WordPress.com site runs the latest WordPress version (%s).' ),
								getFormattedWordPressVersion( site )
							) }
						</Text>
						{ site.is_wpcom_atomic && (
							<Text as="p">
								{ createInterpolateElement(
									__(
										'Switch to a staging site to test a beta version of the next WordPress release. <learnMoreLink />'
									),
									{
										learnMoreLink: <InlineSupportLink supportContext="switch-to-staging-site" />,
									}
								) }
							</Text>
						) }
					</VStack>
				</Notice>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="WordPress"
					description={ __( 'Manage your WordPress version.' ) }
				/>
			}
		>
			<VersionForm site={ site } currentVersion={ currentVersion } />
		</PageLayout>
	);
}
