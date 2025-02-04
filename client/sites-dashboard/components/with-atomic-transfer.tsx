import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useCheckSiteTransferStatus } from '../hooks/use-check-site-transfer-status';
import type { SiteExcerptData } from '@automattic/sites';

const PollAtomicTransfer = ( { site, children }: WithAtomicTransferProps ) => {
	const result = useCheckSiteTransferStatus( { siteId: site.ID, intervalTime: 5000 } );

	return children( result );
};

const MaybePollAtomicTransfer = ( { site, children }: WithAtomicTransferProps ) => {
	if ( site.is_wpcom_atomic ) {
		return children( { wasTransferring: false } );
	}

	const sitePlan = site.plan?.product_slug;

	if ( ! sitePlan ) {
		return children( { wasTransferring: false } );
	}

	const isBusinessOrEcommerceSite = isBusinessPlan( sitePlan ) || isEcommercePlan( sitePlan );

	if ( ! isBusinessOrEcommerceSite ) {
		return children( { wasTransferring: false } );
	}

	return <PollAtomicTransfer site={ site } children={ children } />;
};

type AtomicTransferResult =
	| { wasTransferring: false }
	| ( { wasTransferring: true } & ReturnType< typeof useCheckSiteTransferStatus > );

interface WithAtomicTransferProps {
	site: SiteExcerptData;
	children: ( props: AtomicTransferResult ) => React.ReactElement | null;
}

export const WithAtomicTransfer = ( props: WithAtomicTransferProps ) => {
	return <MaybePollAtomicTransfer key={ props.site.slug } { ...props } />;
};
