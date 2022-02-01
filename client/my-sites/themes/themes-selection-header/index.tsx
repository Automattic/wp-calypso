import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface ThemesSelectionHeaderProps {
	label: string;
	noMarginBeforeHeader: boolean;
}

const ThemesSelectionHeader = ( { label, noMarginBeforeHeader }: ThemesSelectionHeaderProps ) => {
	const translate = useTranslate();

	const classes = classNames( 'themes__themes-selection-header', {
		'margin-before-header': ! noMarginBeforeHeader,
	} );

	return (
		<div className={ classes }>
			<h2>{ label || translate( 'WordPress.com themes' ) }</h2>
		</div>
	);
};

export default ThemesSelectionHeader;
