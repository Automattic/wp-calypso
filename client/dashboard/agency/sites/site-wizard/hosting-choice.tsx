import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useId } from 'react';
import pressableWordmark from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/pressable.svg';
import wpcomWordmark from 'calypso/assets/images/a8c-for-agencies/product-wordmarks/wpcom.svg';
import FeatureChecklist from './feature-checklist';
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
			<FeatureChecklist
				title={ brand.name }
				features={ [
					{
						label: __( 'Multiple sites on one plan' ),
						included: host === 'pressable',
						detail:
							host === 'pressable'
								? __(
										'Choose a plan with room for your client portfolio. Sites share the plan’s traffic and storage allowances.'
									)
								: __(
										'Each site has its own hosting plan. Volume discounts reduce the per-site price as you add more sites.'
									),
					},
					{
						label: __( 'No traffic overage fees' ),
						included: host === 'wpcom',
						detail:
							host === 'wpcom'
								? __(
										'WordPress.com hosting includes unlimited traffic and bandwidth, so a busy month won’t bring traffic overage charges.'
									)
								: __(
										'Pressable includes a traffic allowance shared across your plan. Usage above that allowance may incur overage fees.'
									),
					},
					{
						label: __( 'Staging sites' ),
						detail: __(
							'Test design changes, plugin updates, and new features on a staging copy before applying them to the live site.'
						),
					},
					{
						label: __( 'Managed migrations' ),
						detail: __(
							'Get help moving an existing WordPress site to your new hosting. The migration team guides you through the transfer and launch.'
						),
					},
					{
						label: __( 'SSH & WP-CLI access' ),
						detail: __(
							'Connect over SSH and use WP-CLI to manage WordPress from the command line, automate tasks, and work with your own development tools.'
						),
					},
				] }
			/>
		</div>
	);
}
