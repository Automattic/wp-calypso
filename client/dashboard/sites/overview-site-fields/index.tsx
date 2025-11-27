import { HostingFeatures } from '@automattic/api-core';
import { siteAgencyBlogQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalText as Text, ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { MetadataList, MetadataItem } from '../../components/metadata-list';
import { hasHostingFeature } from '../../utils/site-features';
import { getSiteProviderName, DEFAULT_PROVIDER_NAME } from '../../utils/site-provider';
import { isSelfHostedJetpackConnected, isCommerceGarden } from '../../utils/site-types';
import { getSiteDisplayUrl, getSiteFormattedUrl } from '../../utils/site-url';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { PHPVersion } from '../site-fields';
import type { Site } from '@automattic/api-core';

const HostingProvider = ( { site }: { site: Site } ) => {
	const { data: agencyBlog, isLoading: isLoadingAgencyBlog } = useQuery( {
		...siteAgencyBlogQuery( site.ID ),
		enabled: site.is_wpcom_atomic,
	} );

	if ( isLoadingAgencyBlog ) {
		return null;
	}

	if ( agencyBlog ) {
		return <Text variant="muted">{ __( 'Managed by Automattic for Agencies' ) }</Text>;
	}

	const providerName = getSiteProviderName( site );
	if ( ! providerName && isSelfHostedJetpackConnected( site ) ) {
		return <Text variant="muted">{ __( 'Connected via Jetpack' ) }</Text>;
	}

	return (
		<Text variant="muted">
			{ sprintf(
				/* translators: %s: the hosting provider, e.g.: WordPress.com */
				__( 'Hosted on %s' ),
				providerName ?? DEFAULT_PROVIDER_NAME
			) }
		</Text>
	);
};

const SiteOverviewFields = ( { site }: { site: Site } ) => {
	const url = getSiteFormattedUrl( site );
	const wpVersion = getFormattedWordPressVersion( site );
	const hasPHPFeature = hasHostingFeature( site, HostingFeatures.PHP );
	const hasSiteRedirect = site.options?.is_redirect;

	const fields: React.ReactElement[] = [
		<MetadataItem key="url">
			<ExternalLink href={ url } style={ { overflowWrap: 'anywhere' } }>
				{ getSiteDisplayUrl( site ) }
			</ExternalLink>
		</MetadataItem>,
	];

	if ( hasSiteRedirect ) {
		fields.push(
			<MetadataItem key="redirect">
				<Text variant="muted">
					{ sprintf(
						/* translators: %s: the URL this site is redirected to, e.g.: http://example.com */
						__( 'Redirects to %s' ),
						site.URL
					) }
				</Text>
			</MetadataItem>
		);
	}

	if ( wpVersion ) {
		fields.push(
			<MetadataItem key="wp-version" title={ __( 'WordPress' ) }>
				{ isSelfHostedJetpackConnected( site ) ? (
					<Text variant="muted">{ wpVersion }</Text>
				) : (
					<Link to={ `/sites/${ site.slug }/settings/wordpress` }>{ wpVersion }</Link>
				) }
			</MetadataItem>
		);
	}

	if ( hasPHPFeature ) {
		fields.push(
			<MetadataItem key="php" title={ __( 'PHP' ) }>
				<Link to={ `/sites/${ site.slug }/settings/php` }>
					<PHPVersion site={ site } />
				</Link>
			</MetadataItem>
		);
	}

	if ( ! isCommerceGarden( site ) ) {
		fields.push(
			<MetadataItem key="hosting">
				<HostingProvider site={ site } />
			</MetadataItem>
		);
	}

	return <MetadataList>{ fields }</MetadataList>;
};

export default SiteOverviewFields;
