import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import type { NoteSite } from '../../types';
import type { ReactNode } from 'react';

export default function SiteIdentity( {
	site,
	details,
	url,
}: {
	site: NoteSite;
	details?: ReactNode;
	url?: string;
} ) {
	const icon = site.icon ? (
		<img
			className="wpnc-simplified__site-icon"
			src={ site.icon }
			alt=""
			width={ 36 }
			height={ 36 }
		/>
	) : (
		<Icon className="wpnc-simplified__site-icon is-placeholder" icon={ wordpress } size={ 36 } />
	);

	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			{ url ? (
				<a
					className="wpnc-simplified__photo"
					href={ url }
					target="_blank"
					rel="noreferrer"
					tabIndex={ -1 }
					aria-hidden="true"
				>
					{ icon }
				</a>
			) : (
				icon
			) }
			<VStack spacing={ 1 }>
				<Text
					className="wpnc-simplified__quiet-links"
					size={ 13 }
					weight={ 600 }
					lineHeight="16px"
					truncate
				>
					{ url ? (
						<a href={ url } target="_blank" rel="noreferrer">
							{ site.name }
						</a>
					) : (
						site.name
					) }
				</Text>
				{ details && (
					<Text size={ 12 } lineHeight="16px" variant="muted">
						{ details }
					</Text>
				) }
			</VStack>
		</HStack>
	);
}
