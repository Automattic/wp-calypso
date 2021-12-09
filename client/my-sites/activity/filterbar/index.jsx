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
import ActionTypeSelector from './action-type-selector';
import DateRangeSelector from './date-range-selector';

import './style.scss';

export class Filterbar extends Component {
	state = {
		showActivityTypes: false,
		showActivityDates: false,
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
		} );
		this.scrollIntoView();
	};

	closeActivityTypes = () => {
		this.setState( { showActivityTypes: false } );
	};

	handleRemoveFilters = () => {
		const { siteId, resetFilters } = this.props;
		resetFilters( siteId );
	};

	renderCloseButton = () => {
		const { filter } = this.props;
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
		if ( filter.group || filter.on || filter.before || filter.after ) {
			return false;
		}
		if ( filter.page !== 1 ) {
			return false;
		}
		return true;
	};

	render() {
		const { translate, siteId, filter, isLoading, isVisible } = this.props;

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
					<span className="filterbar__label">{ translate( 'Filter by:' ) }</span>
					<ul className="filterbar__control-list">
						<li>
							<DateRangeSelector
								isVisible={ this.state.showActivityDates }
								onButtonClick={ this.toggleDateRangeSelector }
								onClose={ this.closeDateRangeSelector }
								filter={ filter }
								siteId={ siteId }
							/>
						</li>
						<li>
							<ActionTypeSelector
								filter={ filter }
								siteId={ siteId }
								isVisible={ this.state.showActivityTypes }
								onButtonClick={ this.toggleActivityTypesSelector }
								onClose={ this.closeActivityTypes }
							/>
						</li>
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( Filterbar ) );
