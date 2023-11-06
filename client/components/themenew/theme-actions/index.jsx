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
import ThemeActionActivate from './theme-action-activate';
import ThemeActionCustomize from './theme-action-customize';
import ThemeActionDelete from './theme-action-delete';
import ThemeActionInfo from './theme-action-info';
import ThemeActionLivePreview from './theme-action-live-preview';
import ThemeActionPreview from './theme-action-preview';
import ThemeActionPurchase from './theme-action-purchase';
import ThemeActionSignup from './theme-action-signup';
import ThemeActionSubscribe from './theme-action-subscribe';
import ThemeActionTryAndCustomize from './theme-action-try-and-customize';
import ThemeActionUpgradePlan from './theme-action-upgrade-plan';
import ThemeActionUpgradePlanForBundledThemes from './theme-action-upgrade-plan-for-bundled-themes';
import ThemeActionUpgradePlanForExternallyManagedThemes from './theme-action-upgrade-plan-for-externally-managed-themes';

export default function ThemeActions() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();

	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const moreButtonRef = useRef( null );

	const togglePopover = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', {
			action: isPopoverVisible ? 'popup_close' : 'popup_open',
		} );
		setIsPopoverVisible( ! isPopoverVisible );
	};

	const closePopover = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'popup_close' } );
		setIsPopoverVisible( false );
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
					<ThemeActionPreview />
					<ThemeActionPurchase />
					<ThemeActionSubscribe />
					<ThemeActionUpgradePlan />
					<ThemeActionUpgradePlanForBundledThemes />
					<ThemeActionUpgradePlanForExternallyManagedThemes />
					<ThemeActionActivate />
					<ThemeActionTryAndCustomize />
					<ThemeActionDelete />
					<ThemeActionSignup />

					<PopoverMenuSeparator />

					<ThemeActionInfo />
				</PopoverMenu>
			) }
		</span>
	);
}
