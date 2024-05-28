import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';
/**
 * FormattedHeader component
 * @param {Object} props The props
 * @param {boolean} [props.brandFont] Whether to use the brand font
 * @param {string} [props.id] The ID of the component
 * @param {React.ReactNode} [props.headerText] The header text
 * @param {React.ReactNode} [props.subHeaderText] The subheader text
 * @param {React.ReactNode} [props.tooltipText] The tooltip text
 * @param {string} [props.className] The CSS class name
 * @param {boolean} [props.compactOnMobile] Whether to compact on mobile
 * @param {string} [props.align] The alignment of the component
 * @param {string|null} [props.subHeaderAlign] The alignment of the subheader
 * @param {boolean} [props.isSecondary] Whether it is a secondary header
 * @param {boolean} [props.hasScreenOptions] Whether it has screen options
 * @param {React.ElementType} [props.subHeaderAs] The subheader element type
 * @param {React.ReactNode} [props.children] The children elements
 * @param {React.ReactNode} [props.screenReader] The screen reader text
 * @returns {React.ReactNode} the header
 */
function FormattedHeader( {
	brandFont = false,
	id = '',
	headerText,
	subHeaderText = '',
	tooltipText = '',
	className,
	compactOnMobile = false,
	align = 'center',
	subHeaderAlign = null,
	isSecondary = false,
	hasScreenOptions,
	subHeaderAs: SubHeaderAs = 'p',
	children,
	screenReader = null,
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
		<InfoPopover icon="help-outline" position="right" iconSize={ 18 } showOnHover>
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

export default FormattedHeader;
