import { siteSetPrimaryDomainMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { getSuggestedPrimaryDomain } from '../../utils/domain';
import type { DomainSummary, Site } from '@automattic/api-core';

type SuggestedPrimaryDomain = NonNullable< ReturnType< typeof getSuggestedPrimaryDomain > >;

/**
 * The custom domain to offer as the site address, or `undefined` when there's nothing
 * to suggest. Read at the call site so the notice never decides its own visibility.
 */
export function useSuggestedPrimaryDomain( site: Site ): SuggestedPrimaryDomain | undefined {
	const { queries } = useAppContext();
	const { user } = useAuth();
	const selectSiteDomains = useCallback(
		( data: DomainSummary[] ) => data.filter( ( domain ) => domain.blog_id === site.ID ),
		[ site.ID ]
	);
	const { data: domains } = useQuery( { ...queries.domainsQuery(), select: selectSiteDomains } );

	return domains ? getSuggestedPrimaryDomain( { domains, site, user } ) : undefined;
}

export function SuggestedPrimaryDomainNotice( {
	site,
	domain,
	currentAddress,
}: { site: Site } & SuggestedPrimaryDomain ) {
	const { recordTracksEvent } = useAnalytics();
	const hasRecordedImpression = useRef( false );
	const [ isDismissed, setIsDismissed ] = useState( false );
	const setPrimaryDomainMutation = useMutation(
		withSnackbar( siteSetPrimaryDomainMutation(), {
			success: sprintf(
				/* translators: %s is the domain name */
				__( '%s is now your site address. Your other addresses redirect to it.' ),
				domain
			),
			error: { source: 'server' },
		} )
	);

	// The arbiter only renders the winning candidate, so this counts notices
	// actually shown, not sites eligible to show one.
	useEffect( () => {
		if ( hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_dashboard_suggested_primary_domain_notice_impression', {
			site_id: site.ID,
		} );
	}, [ recordTracksEvent, site.ID ] );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_suggested_primary_domain_notice_submit', {
			site_id: site.ID,
			domain,
		} );

		setPrimaryDomainMutation.mutate( { siteId: site.ID, domain } );
	};

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_dashboard_suggested_primary_domain_notice_dismiss', {
			site_id: site.ID,
		} );
		setIsDismissed( true );
	};

	// In-session only: "Do it later" brings it back on the next visit. Once the switch
	// succeeds, hide it too, instead of offering the same change again until domains refetch.
	if ( isDismissed || setPrimaryDomainMutation.isSuccess ) {
		return null;
	}

	return (
		<Notice
			variant="info"
			title={ sprintf(
				/* translators: %s is the domain name */
				__( 'Make %s your primary site address.' ),
				domain
			) }
			actions={
				<>
					<Button
						variant="primary"
						__next40pxDefaultSize
						onClick={ handleClick }
						isBusy={ setPrimaryDomainMutation.isPending }
						disabled={ setPrimaryDomainMutation.isPending }
						accessibleWhenDisabled
					>
						{ sprintf(
							/* translators: %s is the domain name */
							__( 'Make %s primary site address' ),
							domain
						) }
					</Button>
					<Button variant="link" __next40pxDefaultSize onClick={ handleDismiss }>
						{ __( 'Do it later' ) }
					</Button>
				</>
			}
		>
			{ createInterpolateElement(
				/* translators: <address /> is the site's current address, e.g. example.wordpress.com. */
				__(
					'The current primary site address for this site is <address />. This is the site address your visitors will see while browsing your site. <learnMoreLink />'
				),
				{
					address: <strong>{ currentAddress }</strong>,
					learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
				}
			) }
		</Notice>
	);
}
