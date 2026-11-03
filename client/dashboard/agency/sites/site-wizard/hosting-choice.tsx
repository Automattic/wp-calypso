import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar, code, currencyDollar } from '@wordpress/icons';
import { useId } from 'react';
import pressableWordmark from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/pressable.svg';
import wpcomWordmark from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/wpcom.svg';
import ChoiceFacts from './choice-facts';
import type { Host } from './use-site-wizard';
import type { CSSProperties } from 'react';

const brands = {
	wpcom: { name: 'WordPress.com', wordmark: wpcomWordmark, width: '160px' },
	pressable: { name: 'Pressable', wordmark: pressableWordmark, width: '126px' },
};

export default function HostingChoice( { host, onClick }: { host: Host; onClick: () => void } ) {
	const brand = brands[ host ];
	const descriptionId = useId();
	return (
		<div className="agency-site-wizard__entry-option">
			<Button
				className="agency-site-wizard__hosting-choice"
				data-provider={ host }
				type="button"
				aria-label={ brand.name }
				aria-describedby={ descriptionId }
				onClick={ onClick }
				style={
					{
						'--agency-host-wordmark': `url("${ brand.wordmark }")`,
						'--agency-host-wordmark-width': brand.width,
					} as CSSProperties
				}
			>
				<span className="agency-site-wizard__hosting-wordmark" aria-hidden="true" />
				<span className="agency-site-wizard__hosting-title">
					{ host === 'wpcom' ? __( 'A plan for each site' ) : __( 'A plan for your portfolio' ) }
				</span>
				<span className="agency-site-wizard__hosting-description" id={ descriptionId }>
					{ host === 'wpcom'
						? __( 'Manage each client’s plan individually. Get volume discounts as you grow.' )
						: __( 'Host one or many sites, with traffic and storage shared across your plan.' ) }
				</span>
			</Button>
			<ChoiceFacts
				title={ brand.name }
				facts={ [
					{
						icon: currencyDollar,
						label:
							host === 'wpcom'
								? __( 'Volume discounts as you add sites' )
								: __( 'Many sites share one plan' ),
					},
					{
						icon: chartBar,
						label:
							host === 'wpcom'
								? __( 'Unlimited traffic, no overage fees' )
								: __( 'Shared traffic allowance, overages may apply' ),
					},
					{
						icon: code,
						label: __( 'Staging, SSH, and WP-CLI' ),
					},
				] }
			/>
		</div>
	);
}
