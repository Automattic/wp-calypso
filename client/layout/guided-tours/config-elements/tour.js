import PropTypes from 'prop-types';
import { Component } from 'react';
import { TourContext } from '../context';

export default class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		version: PropTypes.string,
		path: PropTypes.oneOfType( [ PropTypes.string, PropTypes.arrayOf( PropTypes.string ) ] ),
		when: PropTypes.func,
	};

	static contextType = TourContext;

	render() {
		const { children } = this.props;
		const { step } = this.context;
		const nextStep = Array.isArray( children )
			? children.find( ( stepComponent ) => stepComponent.props.name === step )
			: children;

		return nextStep || null;
	}
}
