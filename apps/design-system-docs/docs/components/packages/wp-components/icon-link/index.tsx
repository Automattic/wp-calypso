import { Button } from '@wordpress/components';
import { IconStorybook } from './icon-storybook';

const ICONS = {
	storybook: <IconStorybook />,
};

export const IconLink = ( { href, type }: { href: string; type: keyof typeof ICONS } ) => {
	return (
		<Button
			__next40pxDefaultSize
			accessibleWhenDisabled
			href={ href }
			target="_blank"
			rel="noreferrer"
			icon={ ICONS[ type ] }
			label={ `Open in ${ type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }` }
			size="compact"
		/>
	);
};
