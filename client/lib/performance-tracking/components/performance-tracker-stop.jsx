/**
 * External dependencies
 */

import React from 'react';
import { stopNavigation } from '../api';

export default class PerformanceTrackerStop extends React.Component {
	static propTypes = {};

	componentDidMount() {
		stopNavigation();
	}

	render() {
		return null;
	}
}
