import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuSeparator from 'calypso/components/popover-menu/separator';
import { useSelector } from 'calypso/state';
import { getTheme, isThemeActive } from 'calypso/state/themes/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';
import ThemeActionCustomize from './theme-action-customize';
import ThemeActionLivePreview from './theme-action-live-preview';

export default function ThemeActions() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();

	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const moreButtonRef = useRef( null );

	const togglePopover = () => {
		setIsPopoverVisible( ! isPopoverVisible );
		recordThemeClick( 'calypso_themeshowcase_theme_click', {
			action: isPopoverVisible ? 'popup_close' : 'popup_open',
		} );
	};

	const closePopover = () => {
		setIsPopoverVisible( false );
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'popup_close' } );
	};

	const { name } = theme;

	const className = classnames( 'theme__more-button', {
		'is-active': isActive,
		'is-open': isPopoverVisible,
	} );

	return (
		<span className={ className }>
			<button
				aria-label={ translate( 'More options for theme %(themeName)s', {
					args: { themeName: name },
				} ) }
				onClick={ togglePopover }
				ref={ moreButtonRef }
			>
				<Gridicon icon="ellipsis" size={ 24 } />
			</button>
			{ isPopoverVisible && (
				<PopoverMenu
					context={ moreButtonRef.current }
					isVisible
					onClose={ closePopover }
					position="top left"
				>
					<ThemeActionCustomize />
					<ThemeActionLivePreview />
					<PopoverMenuSeparator />
				</PopoverMenu>
			) }
		</span>
	);
}
