import { HostingFeatures } from '@automattic/api-core';
import { siteAgencyBlogQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { hasHostingFeature } from '../../utils/site-features';
import { getSiteProviderName, DEFAULT_PROVIDER_NAME } from '../../utils/site-provider';
import { isSelfHostedJetpackConnected, isCommerceGarden } from '../../utils/site-types';
import { getSiteDisplayUrl, getSiteFormattedUrl } from '../../utils/site-url';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { PHPVersion } from '../site-fields';
import type { Site } from '@automattic/api-core';
import './style.scss';

const Field = ( { children, title }: { children: React.ReactNode; title?: React.ReactNode } ) => {
	return (
		<HStack
			className="site-overview-field"
			spacing={ 1 }
			style={ { width: 'auto', flexShrink: 0 } }
		>
			{ title && <Text variant="muted">{ title }</Text> }
			<div className="site-overview-field-children">{ children }</div>
		</HStack>
	);
};

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

	if ( isCommerceGarden( site ) ) {
		return (
			<HStack className="site-overview-fields" spacing={ 1 } justify="flex-start">
				<Field>
					<ExternalLink href={ url } style={ { overflowWrap: 'anywhere' } }>
						{ getSiteDisplayUrl( site ) }
					</ExternalLink>
				</Field>
			</HStack>
		);
	}

	return (
		<HStack className="site-overview-fields" spacing={ 1 } justify="flex-start">
			<Field>
				<ExternalLink href={ url } style={ { overflowWrap: 'anywhere' } }>
					{ getSiteDisplayUrl( site ) }
				</ExternalLink>
			</Field>
			{ hasSiteRedirect && (
				<Field>
					<Text variant="muted">
						{ sprintf(
							/* translators: %s: the URL this site is redirected to, e.g.: http://example.com */
							__( 'Redirects to %s' ),
							site.URL
						) }
					</Text>
				</Field>
			) }
			{ wpVersion && (
				<Field title={ __( 'WordPress' ) }>
					{ isSelfHostedJetpackConnected( site ) ? (
						<Text variant="muted">{ wpVersion }</Text>
					) : (
						<Link to={ `/sites/${ site.slug }/settings/wordpress` }>{ wpVersion }</Link>
					) }
				</Field>
			) }
			{ hasPHPFeature && (
				<Field title={ __( 'PHP' ) }>
					<Link to={ `/sites/${ site.slug }/settings/php` }>
						<PHPVersion site={ site } />
					</Link>
				</Field>
			) }
			<Field>
				<HostingProvider site={ site } />
			</Field>
		</HStack>
	);
};

export default SiteOverviewFields;
