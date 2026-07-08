import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { Fragment, ReactNode } from 'react';

import './style.scss';

interface BundleTldChipsProps {
	tlds: string[];
	/**
	 * Optional full label rendered as the first chip before the TLDs, e.g. the
	 * primary domain `thalasso.world` in the inline row (`thalasso.world + .info
	 * + .vip`). Omitted by the top card, which shows TLD-only chips.
	 */
	leadLabel?: ReactNode;
	separator?: ReactNode;
	size?: number;
	className?: string;
}

/**
 * Render a bundle's member TLDs as a prominent line, e.g. `.com + .org + .net`,
 * with each TLD bold/dark and the separators muted. With `leadLabel`, that label
 * anchors the line and the TLDs follow (`thalasso.world + .info + .vip`).
 * Context-free so both the bundle card and the inline bundle row can reuse it.
 */
export const BundleTldChips = ( {
	tlds,
	leadLabel,
	separator = '+',
	size = 24,
	className,
}: BundleTldChipsProps ) => {
	return (
		<HStack
			spacing={ 2 }
			justify="flex-start"
			expanded={ false }
			className={ clsx( 'bundle-tld-chips', className ) }
		>
			{ leadLabel != null && (
				<Text size={ size } weight={ 600 } className="bundle-tld-chips__tld">
					{ leadLabel }
				</Text>
			) }
			{ tlds.map( ( tld, index ) => (
				<Fragment key={ `${ tld }-${ index }` }>
					{ ( index > 0 || leadLabel != null ) && (
						<Text size={ size } aria-hidden="true" className="bundle-tld-chips__separator">
							{ separator }
						</Text>
					) }
					<Text size={ size } weight={ 600 } className="bundle-tld-chips__tld">
						.{ tld }
					</Text>
				</Fragment>
			) ) }
		</HStack>
	);
};
