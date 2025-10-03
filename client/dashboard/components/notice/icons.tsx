import { SVG, Path } from '@wordpress/primitives';

// Use customize caution icon instead of importing from `@wordpress/icons` to differentiate
// from the info icon which is very similar visually.
// See https://github.com/Automattic/wp-calypso/pull/103578#issuecomment-2898451545.
export const caution = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
		<Path
			d="M18 4C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H18ZM6 5.5C5.72386 5.5 5.5 5.72386 5.5 6V18C5.5 18.2761 5.72386 18.5 6 18.5H18C18.2761 18.5 18.5 18.2761 18.5 18V6C18.5 5.72386 18.2761 5.5 18 5.5H6ZM12.75 16H11.25V14.5H12.75V16ZM12.75 13H11.25V8H12.75V13Z"
			fill="#A77F30"
		/>
	</SVG>
);
