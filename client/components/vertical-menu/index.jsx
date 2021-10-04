import PropTypes from 'prop-types';
import { Children, cloneElement, PureComponent } from 'react';

import './style.scss';

const noop = () => {};

export class VerticalMenu extends PureComponent {
	static propTypes = {
		onClick: PropTypes.func,
		initalItemIndex: PropTypes.number,
		children: PropTypes.node,
	};

	static defaultProps = {
		initialItemIndex: 0,
		onClick: noop,
	};

	state = {
		selectedIndex: this.props.initialItemIndex,
	};

	select = ( selectedIndex ) => ( ...args ) => {
		this.setState( { selectedIndex }, () => this.props.onClick( ...args ) );
	};

	render() {
		const { children } = this.props;
		const { selectedIndex } = this.state;

		return (
			<div className="vertical-menu">
				{ Children.map( children, ( Item, index ) =>
					cloneElement( Item, {
						isSelected: index === selectedIndex,
						onClick: this.select( index ),
					} )
				) }
			</div>
		);
	}
}

export default VerticalMenu;
