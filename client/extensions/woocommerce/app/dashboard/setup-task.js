/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';

class SetupTask extends Component {
	static propTypes = {
		actions: PropTypes.arrayOf( PropTypes.shape( {
			isSecondary: PropTypes.bool,
			label: PropTypes.string.isRequired,
			analyticsProp: PropTypes.string.isRequired,
			onClick: PropTypes.func,
			path: PropTypes.string,
		} ) ),
		checked: PropTypes.bool.isRequired,
		explanation: PropTypes.string,
		label: PropTypes.string.isRequired,
	};

	static defaultProps = {
		isSecondary: false,
	}

	track( analyticsProp ) {
		analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: analyticsProp,
		} );
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
						const trackClick = () => {
							this.track( action.analyticsProp );
							if ( target === '_self' ) {
								page.redirect( action.path );
							} else {
								window.open( action.path );
							}
						};
						return (
							<Button
								onClick={ trackClick }
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
						const trackClick = ( e ) => {
							this.track( action.analyticsProp );
							action.onClick( e );
						};
						return (
							<a key={ index } onClick={ trackClick }>{ action.label }</a>
						);
					} )
				}
			</div>
		);
	};

	render = () => {
		const { actions, checked, explanation, label } = this.props;

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
							{ explanation }
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
