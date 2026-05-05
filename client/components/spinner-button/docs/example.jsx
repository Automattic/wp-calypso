import { Component } from 'react';
import SpinnerButton from '../index';

export default class SpinnerButtonExample extends Component {
	render() {
		return (
			<div className="design-assets__group">
				<h2>Spinner Button</h2>
				<div>
					<SpinnerButton text="Default Text" />
				</div>
				<div>
					<SpinnerButton loadingText="Loading" loading />
				</div>
			</div>
		);
	}
}

SpinnerButtonExample.displayName = 'SpinnerButton';
