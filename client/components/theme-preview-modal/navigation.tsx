import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';

interface ThemePreviewModalNavigationProps {
	title: string;
	titleBadge?: React.ReactNode | null;
	onClose: () => void;
}

const ThemePreviewModalNavigation: React.FC< ThemePreviewModalNavigationProps > = ( {
	title,
	titleBadge,
	onClose,
} ) => {
	const translate = useTranslate();

	return (
		<div className="theme-preview-modal__navigation">
			<WordPressLogo size={ 24 } />
			<Button className="theme-preview-modal__navigation-link" borderless onClick={ onClose }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>
			<div className="theme-preview-modal__navigation-title">
				{ title }
				{ titleBadge }
			</div>
			<div className="theme-preview-modal__navigation-action"></div>
		</div>
	);
};

export default ThemePreviewModalNavigation;
