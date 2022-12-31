import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';

interface ThemePreviewModalNavigationProps {
	title: string;
	onClose: () => void;
}

const ThemePreviewModalNavigation: React.FC< ThemePreviewModalNavigationProps > = ( {
	title,
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
			<div className="theme-preview-modal__navigation-title">{ title }</div>
			<div className="theme-preview-modal__navigation-action"></div>
		</div>
	);
};

export default ThemePreviewModalNavigation;
