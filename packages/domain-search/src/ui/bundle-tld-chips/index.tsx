import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { Fragment, ReactNode } from 'react';

import './style.scss';

interface BundleTldChipsProps {
	tlds: string[];
	separator?: ReactNode;
	size?: number;
	className?: string;
}

/**
 * Render a bundle's member TLDs as a prominent line, e.g. `.com + .org + .net`,
 * with each TLD bold/dark and the separators muted. Context-free so both the
 * bundle card and a future inline bundle row can reuse it.
 */
export const BundleTldChips = ( {
	tlds,
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
			{ tlds.map( ( tld, index ) => (
				<Fragment key={ `${ tld }-${ index }` }>
					{ index > 0 && (
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
