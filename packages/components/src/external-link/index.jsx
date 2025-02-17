import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { ScreenReaderText, Gridicon } from '..';

import './style.scss';

/**
 * External link component that optionally includes an external link icon.
 * @type {import('react').FC}
 * @param {Object} props Component props
 * @param {string} [props.className] Additional CSS class names
 * @param {string} [props.href] URL the link points to
 * @param {Function} [props.onClick] Click handler
 * @param {boolean} [props.icon] Whether to show an external link icon
 * @param {number} [props.iconSize] Size of the icon in pixels
 * @param {string} [props.target] Link target attribute
 * @param {boolean} [props.showIconFirst] Whether to show icon before the text
 * @param {string} [props.iconClassName] Additional CSS class for the icon
 * @param {import('react').ReactNode} [props.iconComponent] Custom icon component to use instead of default
 * @param {boolean} [props.localizeUrl] Whether to localize the URL
 * @param {import('react').ReactNode} [props.children] Link content
 * @returns {import('react').ReactElement} External link component
 */
function ExternalLink( {
	className,
	icon = false,
	iconSize = 18,
	showIconFirst = false,
	iconClassName,
	iconComponent = null,
	localizeUrl: shouldLocalizeUrl = true,
	children,
	...rest
} ) {
	const translate = useTranslate();
	const classes = clsx( 'external-link', className, {
		'icon-first': showIconFirst,
		'has-icon': icon,
	} );

	const linkProps = {
		...rest,
		className: classes,
		rel: 'external',
	};

	if ( icon ) {
		linkProps.target = '_blank';
	}

	if ( linkProps.target ) {
		linkProps.rel = linkProps.rel.concat( ' noopener noreferrer' );
	}

	if ( linkProps.href && shouldLocalizeUrl ) {
		linkProps.href = localizeUrl( linkProps.href );
	}

	const iconEl = iconComponent || (
		<Gridicon className={ iconClassName } icon="external" size={ iconSize } />
	);

	return (
		<a { ...linkProps }>
			{ icon && showIconFirst && iconEl }
			{ children }
			{ icon && ! showIconFirst && iconEl }
			{ icon && (
				<ScreenReaderText>
					{ translate( '(opens in a new tab)', {
						comment: 'accessibility label for an external link',
					} ) }
				</ScreenReaderText>
			) }
		</a>
	);
}

ExternalLink.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	onClick: PropTypes.func,
	icon: PropTypes.bool,
	iconSize: PropTypes.number,
	target: PropTypes.string,
	showIconFirst: PropTypes.bool,
	iconClassName: PropTypes.string,
	iconComponent: PropTypes.object,
	localizeUrl: PropTypes.bool,
};
export default ExternalLink;
