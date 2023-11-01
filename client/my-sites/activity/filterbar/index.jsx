import { Button, Gridicon } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import BackButton from 'calypso/components/back-button';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import DateRangeSelector from './date-range-selector';
import TextSelector from './text-selector';
import ActivityTypeSelector from './type-selector/activity-type-selector';
import IssueTypeSelector from './type-selector/issue-type-selector';

import './style.scss';

export class Filterbar extends Component {
	static defaultProps = {
		selectorTypes: { dateRange: true, actionType: true, text: true },
	};

	state = {
		showActivityTypes: false,
		showActivityDates: false,
		showIssueTypes: false,
	};

	goBack = () => {
		const { previousRoute } = this.props;
		if ( previousRoute ) {
			page.back( previousRoute );
			return;
		}
		page.back( 'activity-log' );
	};

	toggleDateRangeSelector = () => {
		this.setState( {
			showActivityDates: ! this.state.showActivityDates,
			showActivityTypes: false,
			showIssueTypes: false,
		} );
		this.scrollIntoView();
	};

	closeDateRangeSelector = () => {
		this.setState( { showActivityDates: false } );
	};

	toggleActivityTypesSelector = () => {
		this.setState( {
			showActivityTypes: ! this.state.showActivityTypes,
			showActivityDates: false,
			showIssueTypes: false,
		} );
		this.scrollIntoView();
	};

	closeActivityTypes = () => {
		this.setState( { showActivityTypes: false } );
	};

	toggleIssueTypesSelector = () => {
		this.setState( ( prevState ) => ( {
			showActivityTypes: false,
			showActivityDates: false,
			showIssueTypes: ! prevState.showIssueTypes,
		} ) );
	};

	closeIssueTypes = () => {
		this.setState( { showIssueTypes: false } );
	};

	handleRemoveFilters = () => {
		const { resetFilters, siteId } = this.props;
		resetFilters( siteId );
	};

	renderCloseButton = () => {
		const { filter, selectorTypes } = this.props;

		// If there is not more than one filter selector then don't render this button
		// which serves to clear multiple filters.
		if ( Object.keys( selectorTypes ).length <= 1 ) {
			return;
		}

		if ( filter && ( filter.group || filter.before || filter.after ) ) {
			return (
				<Button onClick={ this.handleRemoveFilters } borderless className="filterbar__icon-reset">
					<Gridicon icon="cross" />
				</Button>
			);
		}
	};

	scrollIntoView = () => {
		if ( isWithinBreakpoint( '>660px' ) ) {
			//  scroll into view only happends on mobile
			return true;
		}
		const filterbar = document.getElementById( 'filterbar' );
		if ( filterbar ) {
			filterbar.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
			window.scrollBy( 0, -50 );
		}
	};

	isEmptyFilter = ( filter ) => {
		if ( ! filter ) {
			return true;
		}
		if ( filter.group || filter.on || filter.before || filter.after || filter.textSearch ) {
			return false;
		}
		if ( filter.page !== 1 ) {
			return false;
		}
		return true;
	};

	render() {
		const { translate, siteId, filter, isLoading, isVisible, selectorTypes } = this.props;

		if ( siteId && isLoading && this.isEmptyFilter( filter ) ) {
			return <div className="filterbar is-loading" />;
		}

		if ( ! isVisible ) {
			return null;
		}

		if ( filter.backButton ) {
			return (
				<div className="filterbar" id="filterbar">
					<div className="filterbar__wrap card">
						<BackButton onClick={ this.goBack } />
					</div>
				</div>
			);
		}

		return (
			<div className="filterbar" id="filterbar">
				<div className="filterbar__wrap card">
					{ selectorTypes.text && (
						<div className="filterbar__text-control">
							<TextSelector filter={ filter } siteId={ siteId } />
						</div>
					) }
					<span className="filterbar__label">{ translate( 'Filter by:' ) }</span>
					<ul className="filterbar__control-list">
						{ selectorTypes.dateRange && (
							<li>
								<DateRangeSelector
									isVisible={ this.state.showActivityDates }
									onButtonClick={ this.toggleDateRangeSelector }
									onClose={ this.closeDateRangeSelector }
									filter={ filter }
									siteId={ siteId }
								/>
							</li>
						) }
						{ selectorTypes.actionType && (
							<li>
								<ActivityTypeSelector
									filter={ filter }
									siteId={ siteId }
									isVisible={ this.state.showActivityTypes }
									onButtonClick={ this.toggleActivityTypesSelector }
									onClose={ this.closeActivityTypes }
								/>
							</li>
						) }
						{ selectorTypes.issueType && (
							<li>
								<IssueTypeSelector
									filter={ filter }
									siteId={ siteId }
									isVisible={ this.state.showIssueTypes }
									onButtonClick={ this.toggleIssueTypesSelector }
									onClose={ this.closeIssueTypes }
								/>
							</li>
						) }
						<li>{ this.renderCloseButton() }</li>
					</ul>
				</div>
				<div className="filterbar__mobile-wrap" />
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	previousRoute: getPreviousRoute( state ),
} );

const mapDispatchToProps = ( dispatch ) => ( {
	resetFilters: ( siteId ) =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_filterbar_reset' ),
				updateFilter( siteId, { group: null, after: null, before: null, on: null, page: 1 } )
			)
		),
} );

// The mapDispatchToProps has some logic specific to the activity log and this filterbar is now used
// on the agency dashboard, so this export does not use the dispatch so that the agency dashboard can provide
// its own resetFilters(). Ideally this will be structured differently in the future.
export const FilterbarWithoutDispatch = connect( mapStateToProps )( localize( Filterbar ) );

export default connect( mapStateToProps, mapDispatchToProps )( localize( Filterbar ) );
