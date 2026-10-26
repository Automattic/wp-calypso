import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import type { NoteSite } from '../../types';
import type { ReactNode } from 'react';

export default function SiteIdentity( { site, details }: { site: NoteSite; details?: ReactNode } ) {
	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			{ site.icon ? (
				<img
					className="wpnc-simplified__site-icon"
					src={ site.icon }
					alt=""
					width={ 36 }
					height={ 36 }
				/>
			) : (
				<Icon
					className="wpnc-simplified__site-icon is-placeholder"
					icon={ wordpress }
					size={ 36 }
				/>
			) }
			<VStack spacing={ 1 }>
				<Text size={ 13 } weight={ 600 } truncate>
					{ site.name }
				</Text>
				{ details && (
					<Text size={ 12 } variant="muted">
						{ details }
					</Text>
				) }
			</VStack>
		</HStack>
	);
}
