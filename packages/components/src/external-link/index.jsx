import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { ScreenReaderText, Gridicon } from '..';

import './style.scss';

function ExternalLink( {
	className,
	href,
	onClick,
	icon = false,
	iconSize = 18,
	target,
	showIconFirst = false,
	iconClassName,
	iconComponent = null,
	localizeUrl: shouldLocalizeUrl = true,
	children,
	...rest
} ) {
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

	if ( href && shouldLocalizeUrl ) {
		linkProps.href = localizeUrl( href );
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
