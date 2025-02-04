import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Children, PureComponent, cloneElement } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TaskPlaceholder from './task-placeholder';

class Checklist extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		isPlaceholder: PropTypes.bool,
		onExpandTask: PropTypes.func,
		showChecklistHeader: PropTypes.bool,
		checklistFooter: PropTypes.node,
		updateCompletion: PropTypes.func,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		expandedTaskIndex: undefined,
	};

	componentDidMount() {
		this.notifyCompletion();
	}

	componentDidUpdate() {
		this.notifyCompletion();
	}

	notifyCompletion() {
		if ( 'function' === typeof this.props.updateCompletion ) {
			const [ complete, total ] = this.calculateCompletion();
			this.props.updateCompletion( { complete: complete >= total } );
		}
	}

	calculateCompletion() {
		const { children } = this.props;
		const childrenArray = Children.toArray( children ).filter( Boolean );
		const completedCount = childrenArray.reduce(
			( count, task ) => ( true === task.props.completed ? count + 1 : count ),
			0
		);
		const total = childrenArray.length;
		return [ completedCount, total ];
	}

	getExpandedTaskIndex() {
		if ( this.state.expandedTaskIndex !== undefined ) {
			return this.state.expandedTaskIndex;
		}

		// If the user hasn't expanded any task, return the
		// first task that hasn't been completed yet.
		return Children.toArray( this.props.children ).findIndex(
			( task ) => task && ! task.props.completed && ! task.props.inProgress
		);
	}

	setExpandedTask = ( newExpandedTaskIndex ) =>
		void this.setState( ( { expandedTaskIndex } ) => {
			if ( newExpandedTaskIndex === expandedTaskIndex ) {
				return { expandedTaskIndex: null }; // Collapse
			}

			if ( typeof this.props.onExpandTask === 'function' ) {
				this.props.onExpandTask(
					Children.toArray( this.props.children )[ newExpandedTaskIndex ].props
				);
			}

			return { expandedTaskIndex: newExpandedTaskIndex }; // Expand
		} );

	renderChecklistHeader = () => {
		return (
			<Card compact className="checklist__header">
				<h2>{ this.props.translate( 'Your setup list' ) }</h2>
			</Card>
		);
	};

	render() {
		const { showChecklistHeader, checklistFooter } = this.props;
		const [ completed, total ] = this.calculateCompletion();

		if ( this.props.isPlaceholder ) {
			return (
				<div className={ clsx( 'checklist', 'is-expanded', 'is-placeholder' ) }>
					{ showChecklistHeader && completed !== total && this.renderChecklistHeader() }

					<div className="checklist__tasks">
						{ times( total, ( index ) => (
							<TaskPlaceholder key={ index } />
						) ) }
					</div>
				</div>
			);
		}

		let skippedChildren = 0;

		return (
			<div className={ clsx( 'checklist', this.props.className ) }>
				{ showChecklistHeader && completed !== total && this.renderChecklistHeader() }

				<div className="checklist__tasks">
					{ Children.map( this.props.children, ( child, index ) => {
						if ( ! child ) {
							skippedChildren += 1;
							return child;
						}

						const realIndex = index - skippedChildren;

						return cloneElement( child, {
							collapsed: realIndex !== this.getExpandedTaskIndex(),
							onTaskClick: () => this.setExpandedTask( realIndex ),
						} );
					} ) }

					{ checklistFooter }

					{ completed > 0 && completed < total && (
						<div className="checklist__tasks-completed-title">
							{ this.props.translate( 'Completed' ) }
						</div>
					) }
				</div>
			</div>
		);
	}
}

const ChecklistForSite = ( props ) => {
	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();

	return <Checklist key={ siteId } siteId={ siteId } translate={ translate } { ...props } />;
};

export default ChecklistForSite;
