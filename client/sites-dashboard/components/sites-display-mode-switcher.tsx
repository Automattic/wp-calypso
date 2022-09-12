import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const container = css( {
	display: 'flex',
	gap: '10px',
} );

type SitesDisplayMode = 'tile' | 'list';

export const useSitesDisplayMode = () =>
	useAsyncPreference< SitesDisplayMode >( {
		defaultValue: 'tile',
		preferenceName: 'sites-management-dashboard-display-mode',
	} );

interface SitesDisplayModeSwitcherProps {
	onDisplayModeChange( newValue: SitesDisplayMode ): void;
	displayMode: ReturnType< typeof useSitesDisplayMode >[ 0 ];
}

export const SitesDisplayModeSwitcher = ( {
	displayMode,
	onDisplayModeChange,
}: SitesDisplayModeSwitcherProps ) => {
	const { __ } = useI18n();

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<Button
				role="radio"
				aria-label={ __( 'Tile view' ) }
				title={ __( 'Switch to tile view' ) }
				onClick={ () => onDisplayModeChange( 'tile' ) }
				icon={ <Gridicon icon="grid" /> }
				isPressed={ displayMode === 'tile' }
			/>
			<Button
				role="radio"
				aria-label={ __( 'List view' ) }
				title={ __( 'Switch to list view' ) }
				onClick={ () => onDisplayModeChange( 'list' ) }
				icon={ <Gridicon icon="list-unordered" /> }
				isPressed={ displayMode === 'list' }
			/>
		</div>
	);
};
