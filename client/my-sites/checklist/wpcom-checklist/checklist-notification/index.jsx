/** @format */
/**
 * External dependencies
 */
import { Children, Component } from 'react';
import { find, reduce } from 'lodash';

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
		const task = find( childrenArray, child => ! child.props.completed );
		const total = childrenArray.length;
		const completeCount = reduce(
			childrenArray,
			( sum, child ) => ( !! child.props.completed ? sum + 1 : sum ),
			0
		);
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
