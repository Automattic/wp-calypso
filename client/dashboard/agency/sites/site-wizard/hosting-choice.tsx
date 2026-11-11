import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useId } from 'react';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import wpcomLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/wordpress.svg';
import type { HostingEstimate, PressablePitch } from './use-hosting-estimate';
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
	room,
}: {
	host: Host;
	onClick: () => void;
	sites: number;
	estimate?: HostingEstimate;
	isLoading?: boolean;
	/** Spare sites on the plan, shown as a badge when it makes this the better buy. */
	room?: number;
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
				<span className="agency-site-wizard__hosting-price-row">
					<span className="agency-site-wizard__hosting-price">
						{ estimate
							? sprintf(
									/* translators: %s is a monthly price, e.g. "$25". */
									__( '%s/mo' ),
									estimate.total
								)
							: '—' }
					</span>
					{ !! room && (
						<span className="agency-site-wizard__hosting-badge">
							{ sprintf(
								/* translators: %d is how many more sites the plan can hold. */
								_n( 'Room for %d more', 'Room for %d more', room ),
								room
							) }
						</span>
					) }
				</span>
				<span className="agency-site-wizard__hosting-basis">{ context }</span>
			</span>
		</Button>
	);
}

/**
 * The case for Pressable in one line, when the batch leaves room on its plan.
 * Its name carries the brand color so it reads as a note on that card, not a
 * third option.
 */
export function PressablePitchNote( { pitch }: { pitch: PressablePitch } ) {
	let message: string;
	if ( pitch.savings ) {
		message = sprintf(
			/* translators: 1: Spare sites. 2: Sites the plan holds. 3: Monthly savings. */
			_n(
				'<name>Pressable</name> has room for %1$d more site. Fill all %2$d and you’d pay %3$s a month less than on WordPress.com.',
				'<name>Pressable</name> has room for %1$d more sites. Fill all %2$d and you’d pay %3$s a month less than on WordPress.com.',
				pitch.room
			),
			pitch.room,
			pitch.capacity,
			pitch.savings
		);
	} else if ( pitch.extra ) {
		message = sprintf(
			/* translators: 1: Extra cost per month. 2: Spare sites. 3: Price per site when full. */
			_n(
				'For %1$s more a month, <name>Pressable</name> leaves room for %2$d more site with no new plan or bill, about %3$s a site once it’s full.',
				'For %1$s more a month, <name>Pressable</name> leaves room for %2$d more sites with no new plan or bill, about %3$s a site once it’s full.',
				pitch.room
			),
			pitch.extra,
			pitch.room,
			pitch.perSiteWhenFull
		);
	} else {
		message = sprintf(
			/* translators: 1: Spare sites. 2: Price per site when full. */
			_n(
				'<name>Pressable</name> leaves room for %1$d more site with no new plan or bill, about %2$s a site once it’s full.',
				'<name>Pressable</name> leaves room for %1$d more sites with no new plan or bill, about %2$s a site once it’s full.',
				pitch.room
			),
			pitch.room,
			pitch.perSiteWhenFull
		);
	}
	return (
		<p className="agency-site-wizard__pitch">
			{ createInterpolateElement( message, {
				name: <strong className="agency-site-wizard__pitch-name" />,
			} ) }
		</p>
	);
}
