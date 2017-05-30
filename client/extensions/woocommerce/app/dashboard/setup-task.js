/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

// TODO add doc url and documentation link

class SetupTask extends Component {
	static propTypes = {
		actions: PropTypes.arrayOf( PropTypes.shape( {
			isSecondary: PropTypes.bool,
			label: PropTypes.string.isRequired,
			onClick: PropTypes.func,
			path: PropTypes.string,
		} ) ),
		checked: PropTypes.bool.isRequired,
		docURL: PropTypes.string,
		explanation: PropTypes.string,
		label: PropTypes.string.isRequired,
	};

	static defaultProps = {
		isSecondary: false,
	}

	renderTaskPrimaryActions = ( actions, taskCompleted ) => {
		const primaryActions = actions.filter( action => ! action.isSecondary );
		return (
			<div className="dashboard__setup-task-primary-actions">
				{
					primaryActions.map( ( action, index ) => {
						// Only the last primary action gets to be a primary button
						const primary = ( index === primaryActions.length - 1 ) && ! taskCompleted;
						const target = '/' === action.path.substring( 0, 1 ) ? '_self' : '_blank';
						return (
							<Button
								href={ action.path }
								key={ index }
								primary={ primary }
								target={ target }>
								{ action.label }
							</Button>
						);
					} )
				}
			</div>
		);
	};

	renderTaskSecondaryActions = ( actions ) => {
		const secondaryActions = actions.filter( action => action.isSecondary );
		return (
			<div className="dashboard__setup-task-secondary-actions">
				{
					secondaryActions.map( ( action, index ) => {
						return (
							<a key={ index } onClick={ action.onClick }>{ action.label }</a>
						);
					} )
				}
			</div>
		);
	};

	render = () => {
		const { actions, checked, docURL, explanation, label, translate } = this.props;
		const docLink = docURL ? <a href={ docURL }>{ translate( 'Documentation' ) }</a> : null;

		return (
			<div className="dashboard__setup-task">
				<div className="dashboard__setup-task-status">
					{ checked ? <Gridicon icon="checkmark" size={ 36 } /> : null }
				</div>
				<div className="dashboard__setup-task-label-and-actions">
					<div className="dashboard__setup-task-label">
						<h2>
							{ label }
						</h2>
						<p>
							{ explanation } { docLink }
						</p>
					</div>
					<div className="dashboard__setup-task-actions">
						{ this.renderTaskPrimaryActions( actions, checked ) }
						{ this.renderTaskSecondaryActions( actions ) }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( SetupTask );
