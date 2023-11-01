import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getTheme, isThemeActive } from 'calypso/state/themes/selectors';

export default function ThemeActions( { themeId } ) {
	const translate = useTranslate();

	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const isActive = useSelector( ( state ) => isThemeActive( state, themeId ) );

	const { name } = theme;

	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const moreButtonRef = useRef( null );

	const togglePopover = () => {
		setIsPopoverVisible( ! isPopoverVisible );
	};

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
		</span>
	);
}
