import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { Component } from 'react';

interface CurrentThemeButtonProps {
	name: string;
	label: string;
	icon: string;
	href: string;
	onClick: ( this: null, name: string ) => void;
	isPrimary: boolean;
}

export default class extends Component< CurrentThemeButtonProps > {
	static displayName = 'CurrentThemeButton';

	render() {
		return (
			<a
				role="button"
				className={ classNames(
					'current-theme__button',
					'components-button',
					'current-theme__' + this.props.name,
					{
						disabled: ! this.props.href,
						'is-primary': this.props.isPrimary,
						'is-secondary': ! this.props.isPrimary,
					}
				) }
				onClick={ this.props.onClick.bind( null, this.props.name ) }
				href={ this.props.href }
			>
				<Gridicon icon={ this.props.icon } size={ 18 } />
				<span className="current-theme__button-label">{ this.props.label }</span>
			</a>
		);
	}
}
