/**
 * External dependencies
 */
import { Button as OriginalButton } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../constants';
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function ToggleSidebarButton() {
	const { toggleSidebar } = useDispatch( STORE_KEY );

	return (
		<Button
			className="edit-post-fullscreen-mode-close a8c-full-site-editing__close-button"
			icon={ wordpress }
			iconSize={ 36 }
			onClick={ toggleSidebar }
		></Button>
	);
}
