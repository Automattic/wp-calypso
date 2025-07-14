import { __experimentalText as Text, Button } from '@wordpress/components';
import { Callout } from 'calypso/dashboard/components/callout';
import type { Icon } from '@wordpress/components';
import type { ComponentProps } from 'react';

import './style.scss';

const FeatureMoved = ( {
	icon,
	title,
	description,
	buttonText,
	buttonLink,
	image,
}: {
	icon: ComponentProps< typeof Icon >[ 'icon' ];
	title: string;
	description: string;
	buttonText: string;
	buttonLink: string;
	image: string;
} ) => (
	<div className="feature-moved">
		<Callout
			icon={ icon }
			title={ title }
			description={ <Text variant="muted">{ description }</Text> }
			image={ image }
			actions={
				<Button variant="primary" size="compact" href={ buttonLink }>
					{ buttonText }
				</Button>
			}
		/>
	</div>
);

export default FeatureMoved;
