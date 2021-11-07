import { ScreenReaderText, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { localizeUrl } from 'calypso/lib/i18n-utils';

import './style.scss';

class ExternalLink extends Component {
	static defaultProps = {
		iconSize: 18,
		showIconFirst: false,
	};

	static propTypes = {
		className: PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		icon: PropTypes.bool,
		iconSize: PropTypes.number,
		target: PropTypes.string,
		showIconFirst: PropTypes.bool,
		iconClassName: PropTypes.string,
	};

	render() {
		const classes = classnames( 'external-link', this.props.className, {
			'icon-first': this.props.showIconFirst,
			'has-icon': this.props.icon,
		} );

		const props = {
			...omit( this.props, 'icon', 'iconSize', 'showIconFirst', 'iconClassName' ),
			className: classes,
			rel: 'external',
		};

		if ( this.props.icon ) {
			props.target = '_blank';
		}

		if ( props.target ) {
			props.rel = props.rel.concat( ' noopener noreferrer' );
		}

		if ( props.href ) {
			props.href = localizeUrl( props.href );
		}

		const iconComponent = (
			<Gridicon
				className={ this.props.iconClassName }
				icon="external"
				size={ this.props.iconSize }
			/>
		);

		return (
			<a { ...props }>
				{ this.props.icon && this.props.showIconFirst && iconComponent }
				{ this.props.children }
				{ this.props.icon && ! this.props.showIconFirst && iconComponent }
				{ this.props.icon && (
					<ScreenReaderText>
						{ translate( '(opens in a new tab)', {
							comment: 'accessibility label for an external link',
						} ) }
					</ScreenReaderText>
				) }
			</a>
		);
	}
}
export default ExternalLink;
