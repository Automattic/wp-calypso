import { Button } from '@wordpress/components';
import { IconFigma } from './icon-figma';
import { IconStorybook } from './icon-storybook';

export const IconLink = ( { href, type }: { href: string; type: 'figma' | 'storybook' } ) => {
	return (
		<Button
			__next40pxDefaultSize
			accessibleWhenDisabled
			href={ href }
			target="_blank"
			rel="noreferrer"
			icon={ type === 'figma' ? <IconFigma /> : <IconStorybook /> }
			label={ `Open in ${ type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }` }
			size="compact"
		/>
	);
};
