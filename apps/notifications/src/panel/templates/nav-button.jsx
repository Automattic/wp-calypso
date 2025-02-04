import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Gridicon from './gridicons';

const noop = () => {};

export class NavButton extends Component {
	static propTypes = {
		iconName: PropTypes.string.isRequired,
		className: PropTypes.string,
		isEnabled: PropTypes.bool.isRequired,
		navigate: PropTypes.func.isRequired,
	};

	navigate = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		this.props.navigate();
	};

	render() {
		const { className, iconName, isEnabled } = this.props;

		return (
			<button
				className={ clsx( className, { disabled: ! isEnabled } ) }
				disabled={ ! isEnabled }
				onClick={ isEnabled ? this.navigate : noop }
			>
				<Gridicon icon={ iconName } size={ 18 } />
			</button>
		);
	}
}

export default NavButton;
