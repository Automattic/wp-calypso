import { useSelect } from '@wordpress/data';
import { useCanPreviewButNeedUpgrade } from './hooks/use-can-preview-but-need-upgrade';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { LivePreviewUpgradeButton } from './upgrade-button';

const LivePreviewNoticePlugin = () => {
	const isReady = useSelect( ( select ) => select( 'core/editor' ).__unstableIsEditorReady() );
	const previewingTheme = usePreviewingTheme();
	const { canPreviewButNeedUpgrade, upgradePlan } = useCanPreviewButNeedUpgrade( previewingTheme );

	// Do nothing if the user is NOT previewing a theme.
	if ( ! previewingTheme.name ) {
		return null;
	}

	if ( canPreviewButNeedUpgrade && isReady ) {
		return <LivePreviewUpgradeButton { ...{ previewingTheme, upgradePlan } } />;
	}

	return null;
};

export default LivePreviewNoticePlugin;
