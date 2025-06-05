import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

interface NoticeActionProps {
	'aria-label'?: string;
	href?: string | null;
	onClick?: ( ( event: React.MouseEvent< HTMLAnchorElement > ) => void ) | ( () => void );
	external?: boolean;
	icon?: string;
	children?: React.ReactNode;
}

export default class NoticeAction extends Component< NoticeActionProps > {
	static displayName = 'NoticeAction';

	static propTypes = {
		'aria-label': PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		external: PropTypes.bool,
		icon: PropTypes.string,
	};

	static defaultProps = {
		external: false,
	};

	render() {
		const attributes: NoticeActionProps & {
			className?: string;
			target?: string;
			rel?: string;
			tabIndex?: number;
			href?: string;
		} = {
			'aria-label': this.props[ 'aria-label' ],
			className: 'calypso-notice__action',
			href: this.props.href ?? undefined,
			onClick: this.props.onClick,
			tabIndex: 0,
		};

		if ( this.props.external ) {
			attributes.target = '_blank';
			attributes.rel = 'noopener noreferrer';
		}

		return (
			<a { ...attributes }>
				<span>{ this.props.children }</span>
				{ this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				{ this.props.external && <Gridicon icon="external" size={ 24 } /> }
			</a>
		);
	}
}
