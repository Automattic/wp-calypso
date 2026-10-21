import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { TourContext } from '../context';

export default class ConditionalBlock extends PureComponent {
	static propTypes = {
		when: PropTypes.func.isRequired,
	};

	static contextType = TourContext;

	render() {
		const { isValid } = this.context;

		if ( ! isValid( this.props.when ) ) {
			return null;
		}

		return this.props.children;
	}
}
