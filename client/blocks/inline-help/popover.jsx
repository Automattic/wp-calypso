/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectResult, resetInlineHelpContactForm } from 'state/inline-help/actions';
import Button from 'components/button';
import Popover from 'components/popover';
import ProgressBar from 'components/progress-bar';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import getSiteChecklistSummary from 'state/selectors/get-site-checklist-summary';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import QuerySupportTypes from 'blocks/inline-help/inline-help-query-support-types';
import InlineHelpContactView from 'blocks/inline-help/inline-help-contact-view';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		setDialogState: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showSecondaryView: false,
		activeSecondaryView: '',
	};

	openResultView = event => {
		event.preventDefault();
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	setSecondaryViewKey = secondaryViewKey => {
		this.setState( { activeSecondaryView: secondaryViewKey } );
	};

	openSecondaryView = secondaryViewKey => {
		this.setSecondaryViewKey( secondaryViewKey );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show` );
		this.setState( { showSecondaryView: true } );
	};

	closeSecondaryView = () => {
		this.setSecondaryViewKey( '' );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide` );
		this.props.selectResult( -1 );
		this.props.resetContactForm();
		this.setState( { showSecondaryView: false } );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderSecondaryView = () => {
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ this.state.activeSecondaryView }`
		);
		return (
			<div className={ classes }>
				{
					{
						contact: <InlineHelpContactView />,
						richresult: (
							<InlineHelpRichResult
								result={ this.props.selectedResult }
								setDialogState={ this.props.setDialogState }
							/>
						),
					}[ this.state.activeSecondaryView ]
				}
			</div>
		);
	};

	renderChecklistProgress = () => {
		/**
		 * @TODO hide on checklist page?
		 * @TODO move to own component
		 */
		const { checklistSummary, onClose, searchQuery, selectedSiteSlug, translate } = this.props;
		const { numComplete, totalTasks } = checklistSummary;

		if ( searchQuery || ! totalTasks || this.state.showSecondaryView ) {
			return false;
		}

		if ( numComplete === totalTasks ) {
			// @TODO show something else instead and / or kick off the next level of checklist
			return false;
		}

		const href = '/checklist' + ( selectedSiteSlug ? `/${ selectedSiteSlug }` : '' );

		return (
			<div className="inline-help__checklist-progress">
				<Button href={ href } className="inline-help__checklist-button" onClick={ onClose }>
					<span className="inline-help__checklist-progress-label">
						{ translate( 'Site Checklist Progress' ) }
					</span>
					<ProgressBar compact total={ totalTasks } value={ numComplete } />
					<span className="inline-help__checklist-icon-wrapper">
						<Gridicon icon="checkmark" className="inline-help__gridicon-checkmark" />
					</span>
				</Button>
			</div>
		);
	};

	render() {
		const { translate } = this.props;
		const { showSecondaryView } = this.state;
		const popoverClasses = { 'is-secondary-view-active': showSecondaryView };

		return (
			<Popover
				isVisible
				onClose={ this.props.onClose }
				position="top left"
				context={ this.props.context }
				className={ classNames( 'inline-help__popover', popoverClasses ) }
			>
				<QuerySupportTypes />
				<div className="inline-help__search">
					<InlineHelpSearchCard
						openResult={ this.openResultView }
						query={ this.props.searchQuery }
					/>
					<InlineHelpSearchResults
						openResult={ this.openResultView }
						searchQuery={ this.props.searchQuery }
					/>
				</div>

				{ this.renderSecondaryView() }
				{ this.renderChecklistProgress() }

				<div className="inline-help__footer">
					<Button
						onClick={ this.moreHelpClicked }
						className="inline-help__more-button"
						borderless
						href="/help"
					>
						<Gridicon icon="help" className="inline-help__gridicon-left" />
						{ translate( 'More help' ) }
					</Button>

					<Button
						onClick={ this.openContactView }
						className="inline-help__contact-button"
						borderless
					>
						<Gridicon icon="chat" className="inline-help__gridicon-left" />
						{ translate( 'Contact us' ) }
						<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
					</Button>

					<Button
						onClick={ this.closeSecondaryView }
						className="inline-help__cancel-button"
						borderless
					>
						<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
						{ translate( 'Back' ) }
					</Button>
				</div>
			</Popover>
		);
	}
}

export default connect(
	state => ( {
		checklistSummary: getSiteChecklistSummary( state ),
		searchQuery: getSearchQuery( state ),
		selectedSite: getHelpSelectedSite( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
	} ),
	{
		recordTracksEvent,
		selectResult,
		resetContactForm: resetInlineHelpContactForm,
	}
)( localize( InlineHelpPopover ) );
