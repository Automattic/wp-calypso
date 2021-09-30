import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

import './style.scss';

const ThemesSelectionHeader = ( { label, noMarginBeforeHeader } ) => {
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

ThemesSelectionHeader.propTypes = {
	label: PropTypes.string,
	count: PropTypes.number,
};

export default ThemesSelectionHeader;
