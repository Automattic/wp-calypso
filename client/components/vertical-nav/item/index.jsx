import { CompactCard, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

const noop = () => {};

class VerticalNavItem extends Component {
	static propTypes = {
		children: PropTypes.any,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		external: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		onClick: PropTypes.func,
		path: PropTypes.string,
	};

	static defaultProps = {
		external: false,
		isPlaceholder: false,
		onClick: noop,
	};

	getIcon = () => {
		if ( this.props.external ) {
			return <Gridicon icon="external" />;
		}

		return <Gridicon icon="chevron-right" />;
	};

	renderPlaceholder = () => {
		const compactCardClassNames = clsx( 'vertical-nav-item is-placeholder', this.props.className );

		return (
			<CompactCard className={ compactCardClassNames }>
				<span />
				<span />
			</CompactCard>
		);
	};

	render() {
		const { children, className, disabled, external, isPlaceholder, onClick, path } = this.props;

		if ( isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const compactCardClassNames = clsx( 'vertical-nav-item', className, { disabled } );

		const linkProps = external ? { target: '_blank', rel: 'noreferrer' } : {};

		const navItemCard = (
			<CompactCard className={ compactCardClassNames }>
				{ this.getIcon() }
				<span>{ children }</span>
			</CompactCard>
		);

		if ( disabled ) {
			return navItemCard;
		}

		return (
			<a href={ path } onClick={ onClick } { ...linkProps }>
				{ navItemCard }
			</a>
		);
	}
}

export default VerticalNavItem;
