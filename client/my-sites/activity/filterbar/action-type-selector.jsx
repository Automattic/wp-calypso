/**
 * External dependencies
 */
import { isWithinBreakpoint } from '@automattic/viewport';
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { concat, without, isEmpty, find } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';
import { requestActivityActionTypeCounts } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import MobileSelectPortal from './mobile-select-portal';

export class ActionTypeSelector extends Component {
	state = {
		userHasSelected: false,
		selectedCheckboxes: [],
	};

	constructor( props ) {
		super( props );
		this.activityTypeButton = React.createRef();
	}

	resetActivityTypeSelector = ( event ) => {
		const { selectActionType, siteId, activityTypes } = this.props;
		selectActionType( siteId, [], activityTypes );
		event.preventDefault();
	};

	handleToggleAllActionTypeSelector = () => {
		const { activityTypes } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		if ( ! selectedCheckboxes.length ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: activityTypes.map( ( type ) => type.key ),
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [],
			} );
		}
	};

	handleSelectClick = ( event ) => {
		const group = event.target.getAttribute( 'id' );

		if ( this.getSelectedCheckboxes().includes( group ) ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: without( this.getSelectedCheckboxes(), group ),
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: concat( this.getSelectedCheckboxes(), group ),
			} );
		}
	};

	getSelectedCheckboxes = () => {
		const { selectedState } = this.props;
		if ( this.state.userHasSelected ) {
			return this.state.selectedCheckboxes;
		}
		if ( selectedState && selectedState.length ) {
			return selectedState;
		}
		return [];
	};

	activityKeyToName = ( key ) => {
		const { activityTypes } = this.props;
		const match = find( activityTypes, [ 'key', key ] );
		return ( match && match.name ) || key;
	};

	handleClose = () => {
		const { siteId, onClose, selectActionType, activityTypes } = this.props;

		selectActionType( siteId, this.getSelectedCheckboxes(), activityTypes );
		this.setState( {
			userHasSelected: false,
			selectedCheckboxes: [],
		} );
		onClose();
	};

	humanReadable = ( count ) => {
		if ( count >= 1000 ) {
			return this.props.translate( '%(number_over_thousand)d K+', {
				args: {
					number_over_thousand: Math.floor( ( count / 1000 ) * 10 ) / 10,
				},
			} );
		}
		return count;
	};

	renderCheckbox = ( group ) => {
		return (
			<FormLabel key={ group.key }>
				<FormCheckbox
					id={ group.key }
					checked={ this.isSelected( group.key ) }
					name={ group.key }
					onChange={ this.handleSelectClick }
				/>
				{ group.name + ' (' + this.humanReadable( group.count ) + ')' }
			</FormLabel>
		);
	};

	renderCheckboxSelection = () => {
		const { translate, activityTypes } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();

		return (
			<div className="filterbar__activity-types-selection-wrap">
				{ activityTypes && !! activityTypes.length && (
					<div>
						<Fragment>
							<div className="filterbar__activity-types-selection-granular">
								{ activityTypes.map( this.renderCheckbox ) }
							</div>
						</Fragment>
						<div className="filterbar__activity-types-selection-info">
							<div className="filterbar__date-range-info">
								{ selectedCheckboxes.length === 0 && (
									<Button borderless compact onClick={ this.handleToggleAllActionTypeSelector }>
										{ translate( '{{icon/}} select all', {
											components: { icon: <Gridicon icon="checkmark" /> },
										} ) }
									</Button>
								) }
								{ selectedCheckboxes.length !== 0 && (
									<Button borderless compact onClick={ this.handleToggleAllActionTypeSelector }>
										{ translate( '{{icon/}} clear', {
											components: { icon: <Gridicon icon="cross-small" /> },
										} ) }
									</Button>
								) }
							</div>
							<Button
								className="filterbar__activity-types-apply"
								primary
								compact
								disabled={ ! this.state.userHasSelected }
								onClick={ this.handleClose }
							>
								{ translate( 'Apply' ) }
							</Button>
						</div>
					</div>
				) }
				{ ! activityTypes && [ 1, 2, 3 ].map( this.renderPlaceholder ) }
				{ activityTypes && ! activityTypes.length && (
					<p>{ translate( 'No activities recorded in the selected date range.' ) }</p>
				) }
			</div>
		);
	};

	renderPlaceholder = ( i ) => {
		return (
			<div className="filterbar__activity-types-selection-placeholder" key={ 'placeholder' + i } />
		);
	};

	isSelected = ( key ) => this.getSelectedCheckboxes().includes( key );

	handleButtonClick = () => {
		const { isVisible, onButtonClick } = this.props;
		if ( isVisible ) {
			this.handleClose();
		}
		onButtonClick();
	};

	render() {
		const { translate, isVisible } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		const hasSelectedCheckboxes = ! isEmpty( selectedCheckboxes );

		const buttonClass = classnames( 'filterbar__selection', {
			'is-selected': hasSelectedCheckboxes,
			'is-active': isVisible && ! hasSelectedCheckboxes,
		} );

		return (
			<Fragment>
				<Button
					className={ buttonClass }
					compact
					borderless
					onClick={ this.handleButtonClick }
					ref={ this.activityTypeButton }
				>
					{ translate( 'Activity Type' ) }
					{ hasSelectedCheckboxes && <span>: </span> }
					{ hasSelectedCheckboxes && selectedCheckboxes.map( this.activityKeyToName ).join( ', ' ) }
				</Button>
				{ hasSelectedCheckboxes && (
					<Button
						className="filterbar__selection-close"
						compact
						borderless
						onClick={ this.resetActivityTypeSelector }
					>
						<Gridicon icon="cross-small" />
					</Button>
				) }
				{ isWithinBreakpoint( '>660px' ) && (
					<Popover
						id="filterbar__activity-types"
						isVisible={ isVisible }
						onClose={ this.handleClose }
						position="bottom"
						relativePosition={ { left: -80 } }
						context={ this.activityTypeButton.current }
					>
						{ this.renderCheckboxSelection() }
					</Popover>
				) }
				{ ! isWithinBreakpoint( '>660px' ) && (
					<MobileSelectPortal isVisible={ isVisible }>
						<Card>{ this.renderCheckboxSelection() }</Card>
					</MobileSelectPortal>
				) }
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter } ) => {
	const activityTypes = siteId && requestActivityActionTypeCounts( siteId, filter );
	const selectedState = filter && filter.group;
	return {
		activityTypes: ( siteId && activityTypes.data ) || [],
		selectedState,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	selectActionType: ( siteId, group, allTypes ) => {
		if ( 0 === group.length ) {
			return dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_activitylog_filterbar_reset_type' ),
					updateFilter( siteId, { group: null, page: 1 } )
				)
			);
		}
		const eventProps = { num_groups_selected: group.length };
		allTypes.forEach(
			( type ) => ( eventProps[ 'group_' + type.key ] = group.includes( type.key ) )
		);
		eventProps.num_total_activities_selected = allTypes.reduce( ( accumulator, type ) => {
			return group.includes( type.key ) ? accumulator + type.count : accumulator;
		}, 0 );

		return dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_filterbar_select_type', eventProps ),
				updateFilter( siteId, { group: group, page: 1 } )
			)
		);
	},
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ActionTypeSelector ) );
