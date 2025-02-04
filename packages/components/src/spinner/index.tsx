import clsx from 'clsx';
import { PureComponent } from 'react';

import './style.scss';

export class Spinner extends PureComponent< {
	className?: string;
	size?: number;
	baseClassName?: string;
} > {
	static defaultProps = {
		size: 20,
		baseClassName: 'spinner',
	};

	render() {
		const className = clsx( this.props.baseClassName, this.props.className );

		const style = {
			width: this.props.size,
			height: this.props.size,
			fontSize: this.props.size, // allows border-width to be specified in em units
		};

		return (
			<div className={ className }>
				<div className="spinner__outer" style={ style }>
					<div className="spinner__inner" />
				</div>
			</div>
		);
	}
}
