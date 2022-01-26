import { Button, Card, Popover, Gridicon } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { createRef, Component, Fragment } from 'react';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import wpcom from 'calypso/lib/wp';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import fromActivityTypeApi from 'calypso/state/data-layer/wpcom/sites/activity-types/from-api';
import MobileSelectPortal from './mobile-select-portal';

export class ActionTypeSelector extends Component {
	state = {
		userHasSelected: false,
		selectedCheckboxes: [],
	};

	activityTypeButton = createRef();

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
				selectedCheckboxes: this.getSelectedCheckboxes().filter( ( ch ) => ch !== group ),
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [ ...new Set( this.getSelectedCheckboxes() ).add( group ) ],
			} );
		}
	};

	getSelectedCheckboxes = () => {
		if ( this.state.userHasSelected ) {
			return this.state.selectedCheckboxes;
		}
		if ( this.props.filter?.group?.length ) {
			return this.props.filter.group;
		}
		return [];
	};

	activityKeyToName = ( key ) => {
		const { activityTypes } = this.props;
		const match = activityTypes.find( ( item ) => item.key === key );
		return match?.name ?? key;
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
		const hasSelectedCheckboxes = selectedCheckboxes.length > 0;

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

const activityCountsQueryKey = ( siteId, filter ) => [
	'activity-log-counts',
	siteId,
	filter.before ?? '',
	filter.after ?? '',
	filter.on ?? '',
];
const withActivityTypes = ( WrappedComponent ) => ( props ) => {
	const { siteId, filter } = props;
	const { data } = useQuery(
		activityCountsQueryKey( siteId, filter ),
		() =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity/count/group`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( filter, false )
				)
				.then( fromActivityTypeApi ),
		{
			enabled: !! siteId,
			staleTime: 10 * 1000,
		}
	);
	return <WrappedComponent { ...props } activityTypes={ data ?? [] } />;
};

const selectActionType = ( siteId, group, allTypes ) => ( dispatch ) => {
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
};

export default withActivityTypes(
	connect( null, { selectActionType } )( localize( ActionTypeSelector ) )
);
