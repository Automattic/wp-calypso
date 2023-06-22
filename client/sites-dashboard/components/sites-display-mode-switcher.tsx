import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const container = css( {
	display: 'flex',
	gap: '10px',
} );

export type SitesDisplayMode = 'tile' | 'list';

export const useSitesDisplayMode = () => {
	const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );
	return useAsyncPreference< SitesDisplayMode >( {
		defaultValue: siteCount && siteCount > 6 ? 'list' : 'tile',
		preferenceName: 'sites-management-dashboard-display-mode',
	} );
};

interface SitesDisplayModeSwitcherProps {
	onDisplayModeChange?( newValue: SitesDisplayMode ): void;
	displayMode?: ReturnType< typeof useSitesDisplayMode >[ 0 ];
}

export const SitesDisplayModeSwitcher = ( {
	displayMode,
	onDisplayModeChange,
}: SitesDisplayModeSwitcherProps ) => {
	const { __ } = useI18n();
	const tileRef = useRef< HTMLButtonElement >( null );
	const listRef = useRef< HTMLButtonElement >( null );

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent, currentMode: SitesDisplayMode ) => {
			if (
				[
					'Up',
					'ArrowUp',
					'Left',
					'ArrowLeft',
					'Down',
					'ArrowDown',
					'Right',
					'ArrowRight',
				].includes( event.key )
			) {
				event.preventDefault();
				const newMode = currentMode === 'tile' ? 'list' : 'tile';
				if ( newMode === 'tile' ) {
					tileRef.current?.focus();
				} else {
					listRef.current?.focus();
				}
				onDisplayModeChange?.( newMode );
			}
		},
		[ onDisplayModeChange ]
	);

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<Button
				role="radio"
				aria-label={ __( 'Tile view' ) }
				title={ __( 'Switch to tile view' ) }
				onClick={ () => onDisplayModeChange?.( 'tile' ) }
				icon={ <Gridicon icon="grid" /> }
				ref={ tileRef }
				onKeyDown={ ( event: React.KeyboardEvent ) => handleKeyDown( event, 'tile' ) }
				aria-checked={ displayMode === 'tile' }
				tabIndex={ displayMode === 'tile' ? 0 : -1 }
				// aria-checked is the correct attribute to show a radio button is selected, but we
				// still want to use the Button component's built in isPressed styling.
				className={ displayMode === 'tile' ? 'is-pressed' : '' }
			/>
			<Button
				role="radio"
				aria-label={ __( 'List view' ) }
				title={ __( 'Switch to list view' ) }
				onClick={ () => onDisplayModeChange?.( 'list' ) }
				icon={ <Gridicon icon="list-unordered" /> }
				ref={ listRef }
				onKeyDown={ ( event: React.KeyboardEvent ) => handleKeyDown( event, 'list' ) }
				aria-checked={ displayMode === 'list' }
				tabIndex={ displayMode === 'list' ? 0 : -1 }
				className={ displayMode === 'list' ? 'is-pressed' : '' }
			/>
		</div>
	);
};
