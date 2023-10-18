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
	subHeaderAlign,
	isSecondary,
	hasScreenOptions,
	subHeaderAs: SubHeaderAs = 'p',
	children,
	screenReader,
} ) {
	const classes = classNames( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
		'is-compact-on-mobile': compactOnMobile,
		'is-left-align': 'left' === align,
		'is-right-align': 'right' === align,
		'has-screen-options': hasScreenOptions,
	} );

	const headerClasses = classNames( 'formatted-header__title', { 'wp-brand-font': brandFont } );
	const subtitleClasses = classNames( 'formatted-header__subtitle', {
		'is-center-align': 'center' === subHeaderAlign,
	} );
	const tooltip = tooltipText && (
		<InfoPopover icon="help-outline" position="right" iconSize={ 18 } showOnHover={ true }>
			{ tooltipText }
		</InfoPopover>
	);

	return (
		<header id={ id } className={ classes }>
			<div>
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
				{ screenReader && <h2 className="screen-reader-text">{ screenReader }</h2> }
				{ subHeaderText && (
					<SubHeaderAs className={ subtitleClasses }>
						{ preventWidows( subHeaderText, 2 ) }
					</SubHeaderAs>
				) }
			</div>
			{ children }
		</header>
	);
}

FormattedHeader.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	brandFont: PropTypes.bool,
	headerText: PropTypes.node,
	subHeaderAs: PropTypes.elementType,
	subHeaderText: PropTypes.node,
	tooltipText: PropTypes.node,
	compactOnMobile: PropTypes.bool,
	isSecondary: PropTypes.bool,
	align: PropTypes.oneOf( [ 'center', 'left', 'right' ] ),
	subHeaderAlign: PropTypes.oneOf( [ 'center', null ] ),
	hasScreenOptions: PropTypes.bool,
	children: PropTypes.node,
	screenReader: PropTypes.node,
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
	subHeaderAlign: null,
	screenReader: null,
};

export default FormattedHeader;
