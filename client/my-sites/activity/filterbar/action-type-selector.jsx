/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { concat, without, isEmpty, find } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';
import { requestActivityActionTypeCounts } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';

export class ActionTypeSelector extends Component {
	state = {
		userHasSelected: false,
		selectedCheckboxes: [],
	};

	constructor( props ) {
		super( props );
		this.activityTypeButton = React.createRef();
	}

	resetActivityTypeSelector = event => {
		const { selectActionType, siteId } = this.props;
		selectActionType( siteId, [] );
		event.preventDefault();
	};

	handleToggleAllActionTypeSelector = () => {
		const { activityTypes } = this.props;
		if ( this.isAllCheckboxSelected() ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [],
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: activityTypes.map( type => type.key ),
			} );
		}
	};

	handleSelectClick = event => {
		const group = event.target.getAttribute( 'id' );

		if ( this.isAllCheckboxSelected() ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [ group ],
			} );
		} else if ( this.getSelectedCheckboxes().includes( group ) ) {
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

	activityKeyToName = key => {
		const { activityTypes } = this.props;
		const match = find( activityTypes, [ 'key', key ] );
		return ( match && match.name ) || key;
	};

	isAllCheckboxSelected = () => {
		const { activityTypes, selectedState } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();

		if ( ! this.state.userHasSelected && ! selectedState ) {
			return true;
		}

		if ( selectedCheckboxes.length === activityTypes.length ) {
			return true;
		}

		return false;
	};

	handleClose = () => {
		const { siteId, onClose, selectActionType } = this.props;
		if ( this.isAllCheckboxSelected() ) {
			selectActionType( siteId, [] );
		} else {
			selectActionType( siteId, this.getSelectedCheckboxes() );
		}

		this.setState( {
			userHasSelected: false,
			selectedCheckboxes: [],
		} );
		onClose();
	};

	renderCheckbox = group => {
		return (
			<FormLabel key={ group.key }>
				<FormCheckbox
					id={ group.key }
					checked={ this.isSelected( group.key ) || this.isAllCheckboxSelected() }
					name={ group.key }
					onChange={ this.handleSelectClick }
				/>
				{ group.name + ' (' + group.count + ')' }
			</FormLabel>
		);
	};

	renderPlaceholder = i => {
		return (
			<div className="filterbar__activity-types-selection-placeholder" key={ 'placeholder' + i } />
		);
	};

	isSelected = key => this.getSelectedCheckboxes().includes( key );

	render() {
		const { translate, activityTypes, isVisible, onButtonClick } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		const hasSelectedCheckboxes = ! isEmpty( selectedCheckboxes ) && ! this.isAllCheckboxSelected();
		const totalItems = activityTypes
			? activityTypes.reduce( ( accumulator, currentValue ) => currentValue.count + accumulator, 0 )
			: 0;

		const buttonClass = classnames( {
			filterbar__selection: true,
			'is-selected': hasSelectedCheckboxes,
		} );

		return (
			<Fragment>
				<Button
					className={ buttonClass }
					compact
					borderless
					onClick={ onButtonClick }
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
				<Popover
					id="filterbar__activity-types"
					isVisible={ isVisible }
					onClose={ this.handleClose }
					autoPosition={ true }
					context={ this.activityTypeButton.current }
				>
					<div className="filterbar__activity-types-selection-wrap">
						{ activityTypes &&
							!! activityTypes.length && (
								<div>
									<Fragment>
										<FormLabel>
											<FormCheckbox
												id="comment_like_notification"
												onChange={ this.handleToggleAllActionTypeSelector }
												checked={ this.isAllCheckboxSelected() }
												name="comment_like_notification"
											/>
											<strong>
												{ translate( 'All activity types (%(totalCount)d)', {
													args: { totalCount: totalItems },
												} ) }
											</strong>
										</FormLabel>
										<div className="filterbar__activity-types-selection-granular">
											{ activityTypes.map( this.renderCheckbox ) }
										</div>
									</Fragment>
									<div className="filterbar__activity-types-selection-info">
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
						{ activityTypes &&
							! activityTypes.length && (
								<p>{ translate( 'No activities recorded in the selected date range.' ) }</p>
							) }
					</div>
				</Popover>
			</Fragment>
		);
	}
}

export default connect(
	( state, { siteId, filter } ) => {
		const activityTypes = siteId && requestActivityActionTypeCounts( siteId, filter );
		const selectedState = filter && filter.group;
		return {
			activityTypes: ( siteId && activityTypes.data ) || [],
			selectedState,
		};
	},
	{
		selectActionType: ( siteId, group ) => updateFilter( siteId, { group: group, page: 1 } ),
	}
)( localize( ActionTypeSelector ) );
