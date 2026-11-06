import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useId } from 'react';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import wpcomLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/wordpress.svg';
import type { HostingEstimate } from './use-hosting-estimate';
import type { Host } from './use-site-wizard';

function getBrand( host: Host ) {
	return host === 'wpcom'
		? {
				name: 'WordPress.com',
				logo: wpcomLogo,
				model: __( 'Each site gets its own plan, so you can bill every client separately.' ),
				features: [ __( 'Backups and security' ), __( 'Global CDN' ), __( 'Staging sites' ) ],
			}
		: {
				name: 'Pressable',
				logo: pressableLogo,
				model: __( 'One plan hosts all your sites, sharing its traffic and storage.' ),
				features: [ __( 'Daily backups' ), __( 'Staging sites' ), __( '24/7 WordPress support' ) ],
			};
}

/** What the estimate covers, in the terms each host sells by. Kept to one line. */
function getPriceContext( host: Host, sites: number, estimate: HostingEstimate ) {
	if ( host === 'pressable' ) {
		return sprintf(
			/* translators: 1: A plan name, e.g. "Build". 2: How many sites the plan holds. */
			_n( '%1$s plan, up to %2$d site', '%1$s plan, up to %2$d sites', estimate.capacity ?? 1 ),
			estimate.plan ?? '',
			estimate.capacity ?? 1
		);
	}
	if ( sites === 1 ) {
		return __( 'Billed per site' );
	}
	if ( estimate.discounted ) {
		return sprintf(
			/* translators: 1: The number of sites. 2: A per-site monthly price. */
			__( '%1$d sites at %2$s, discounted' ),
			sites,
			estimate.perSite ?? ''
		);
	}
	return sprintf(
		/* translators: 1: The number of sites. 2: A per-site monthly price. */
		__( '%1$d sites at %2$s' ),
		sites,
		estimate.perSite ?? ''
	);
}

export default function HostingChoice( {
	host,
	onClick,
	sites,
	estimate,
	isLoading,
}: {
	host: Host;
	onClick: () => void;
	sites: number;
	estimate?: HostingEstimate;
	isLoading?: boolean;
} ) {
	const brand = getBrand( host );
	const descriptionId = useId();
	let context: string = __( 'See prices in the Marketplace' );
	if ( isLoading ) {
		context = __( 'Loading prices…' );
	} else if ( estimate ) {
		context = getPriceContext( host, sites, estimate );
	}
	return (
		<Button
			__next40pxDefaultSize
			className="agency-site-wizard__hosting-choice"
			data-provider={ host }
			type="button"
			aria-label={ brand.name }
			aria-describedby={ descriptionId }
			onClick={ onClick }
		>
			<span className="agency-site-wizard__hosting-brand">
				<img src={ brand.logo } alt="" width={ 24 } height={ 24 } />
				<span className="agency-site-wizard__hosting-name">{ brand.name }</span>
			</span>
			<span className="agency-site-wizard__hosting-model" id={ descriptionId }>
				{ brand.model }
			</span>
			<span className="agency-site-wizard__hosting-features">
				{ brand.features.map( ( feature ) => (
					<span key={ feature } className="agency-site-wizard__hosting-feature">
						<Icon icon={ check } size={ 20 } />
						{ feature }
					</span>
				) ) }
			</span>
			<span className="agency-site-wizard__hosting-estimate">
				<span className="agency-site-wizard__hosting-price">
					{ estimate
						? sprintf(
								/* translators: %s is a monthly price, e.g. "$25". */
								__( '%s/mo' ),
								estimate.total
							)
						: '—' }
				</span>
				<span className="agency-site-wizard__hosting-basis">{ context }</span>
			</span>
		</Button>
	);
}
