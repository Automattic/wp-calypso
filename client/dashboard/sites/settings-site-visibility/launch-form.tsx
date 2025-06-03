import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { agencyBlogQuery } from '../../app/queries';
import type { Site } from '../../data/types';

function useAgencyBillingMessage( site: Site ) {
	const { data, isLoading: isLoading, isError: isError } = useQuery( agencyBlogQuery( site.ID ) );
	if ( ! data ) {
		return undefined;
	}

	const priceInfoIsDefined =
		Number.isFinite( data.prices?.actual_price ) && typeof data.prices?.currency === 'string';

	if ( isLoading || isError || ! priceInfoIsDefined ) {
		return __( "After launch, we'll bill your agency in the next billing cycle." );
	}

	const { existing_wpcom_license_count: existingWPCOMLicenseCount = 0, name, prices } = data;
	const price = formatCurrency( prices.actual_price, prices.currency );

	return createInterpolateElement(
		sprintf(
			/* translators: agencyName is the name of the agency that will be billed for the site; licenseCount is the number of licenses the agency will be billed for; price is the price per license */
			_n(
				"After launch, we'll bill %(agencyName)s in the next billing cycle. With %(licenseCount)s production hosting license, you will be charged %(price)s / license / month. <learnMoreLink>Learn more.</learnMoreLink>",
				"After launch, we'll bill %(agencyName)s in the next billing cycle. With %(licenseCount)s production hosting licenses, you will be charged %(price)s / license / month. <learnMoreLink>Learn more.</learnMoreLink>",
				existingWPCOMLicenseCount + 1
			),
			{
				agencyName: name,
				licenseCount: existingWPCOMLicenseCount + 1,
				price,
			}
		),
		{
			learnMoreLink: (
				<ExternalLink
					href="https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting/"
					children={ null }
				/>
			),
		}
	);
}

export function LaunchAgencyDevelopmentSiteForm( {
	site,
	onLaunchClick,
}: {
	site: Site;
	onLaunchClick: () => void;
} ) {
	const billingMessage = useAgencyBillingMessage( site );
	const handleReferClientClick = () => {
		window.location.href = `https://agencies.automattic.com/marketplace/checkout?referral_blog_id=${ site.ID }`;
	};

	return (
		<VStack spacing={ 4 } alignment="left">
			<Text>
				{ __(
					'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
				) }
			</Text>
			{ billingMessage && <Text>{ billingMessage }</Text> }
			<HStack justify="flex-start">
				<Button __next40pxDefaultSize variant="primary" onClick={ () => onLaunchClick() }>
					{ __( 'Launch site' ) }
				</Button>
				<Button __next40pxDefaultSize variant="secondary" onClick={ handleReferClientClick }>
					{ __( 'Refer a client' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

export function LaunchForm( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 4 } alignment="left">
			<Text>
				{ __(
					'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
				) }
			</Text>
			<Button
				__next40pxDefaultSize
				variant="primary"
				href={ addQueryArgs( '/start/launch-site', {
					siteSlug: site.slug,
					new: site.name,
					hide_initial_query: 'yes',
				} ) }
			>
				{ __( 'Launch site' ) }
			</Button>
		</VStack>
	);
}
