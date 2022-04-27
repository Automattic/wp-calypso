import classNames from 'classnames';
import PropTypes from 'prop-types';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

function FormattedHeader( {
	brandFont,
	id,
	headerText,
	subHeaderText,
	tooltipText,
	className,
	compactOnMobile,
	align,
	isSecondary,
	hasScreenOptions,
} ) {
	const classes = classNames( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
		'is-compact-on-mobile': compactOnMobile,
		'is-left-align': 'left' === align,
		'is-right-align': 'right' === align,
		'has-screen-options': hasScreenOptions,
	} );

	const headerClasses = classNames( 'formatted-header__title', { 'wp-brand-font': brandFont } );
	const tooltip = tooltipText && (
		<InfoPopover icon="help-outline" position="right" iconSize={ 18 } showOnHover={ true }>
			{ tooltipText }
		</InfoPopover>
	);

	return (
		<header id={ id } className={ classes }>
			{ ! isSecondary && (
				<h1 className={ headerClasses }>
					{ preventWidows( headerText, 2 ) } { tooltip }
				</h1>
			) }
			{ isSecondary && (
				<h2 className={ headerClasses }>
					{ preventWidows( headerText, 2 ) } { tooltip }
				</h2>
			) }
			{ subHeaderText && (
				<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
			) }
		</header>
	);
}

FormattedHeader.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	brandFont: PropTypes.bool,
	headerText: PropTypes.node,
	subHeaderText: PropTypes.node,
	tooltipText: PropTypes.node,
	compactOnMobile: PropTypes.bool,
	isSecondary: PropTypes.bool,
	align: PropTypes.oneOf( [ 'center', 'left', 'right' ] ),
	hasScreenOptions: PropTypes.bool,
};

FormattedHeader.defaultProps = {
	id: '',
	className: '',
	brandFont: false,
	subHeaderText: '',
	tooltipText: '',
	compactOnMobile: false,
	isSecondary: false,
	align: 'center',
};

export default FormattedHeader;
