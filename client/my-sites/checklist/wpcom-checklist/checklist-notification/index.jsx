/** @format */
/**
 * External dependencies
 */
import { Children, Component } from 'react';

export class ChecklistNotification extends Component {
	componentDidMount() {
		this.shouldShowNotification();
	}

	componentDidUpdate() {
		this.shouldShowNotification();
	}

	shouldShowNotification = () => {
		const { storedTask, canShowChecklist, children } = this.props;

		// The redux state for getSiteChecklist() is injected from an API response
		// so the selector's results and the task list will not always match
		// Therefore, we're accessing the child Tasks directly for accuracy

		const childrenArray = Children.toArray( children );
		const task = childrenArray.find( child => ! child.props.completed );
		const total = childrenArray.length;
		const completeCount = childrenArray.filter( child => child.props.completed ).length;
		const isFinished = completeCount >= total;

		this.props.setNotification( false );

		if (
			task &&
			( storedTask !== task.key || storedTask === null ) &&
			! isFinished &&
			canShowChecklist
		) {
			this.props.setNotification( true );
		}
	};

	render() {
		return null;
	}
}

export default ChecklistNotification;
