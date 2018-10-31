/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';

export class ChecklistNotification extends Component {
	componentDidMount() {
		this.shouldShowNotification();
	}

	componentDidUpdate() {
		this.shouldShowNotification();
	}

	shouldShowNotification = () => {
		const { storedTask, canShowChecklist, taskList } = this.props;
		const firstIncomplete = taskList.getFirstIncompleteTask();

		if (
			firstIncomplete &&
			( storedTask !== firstIncomplete.id || storedTask === null ) &&
			canShowChecklist
		) {
			this.props.setNotification( true );
		} else {
			this.props.setNotification( false );
		}
	};

	render() {
		return null;
	}
}

export default ChecklistNotification;
