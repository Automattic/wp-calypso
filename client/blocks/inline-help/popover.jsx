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
import { VIEW_CONTACT, VIEW_FORUM, VIEW_RICH_RESULT } from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectResult, resetInlineHelpContactForm } from 'state/inline-help/actions';
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import InlineHelpForumView from './inline-help-forum-view';
import HelpContact from 'me/help/help-contact';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import getInlineHelpSupportVariation, {
	SUPPORT_FORUM,
} from 'state/selectors/get-inline-help-support-variation';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
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
		const showForumGuide = this.props.supportVariation === SUPPORT_FORUM;
		this.openSecondaryView( showForumGuide ? VIEW_FORUM : VIEW_CONTACT );
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
						contact: <HelpContact compact selectedSite={ this.props.selectedSite } />,
						richresult: <InlineHelpRichResult result={ this.props.selectedResult } />,
						forums: <InlineHelpForumView />,
					}[ this.state.activeSecondaryView ]
				}
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
		searchQuery: getSearchQuery( state ),
		selectedSite: getHelpSelectedSite( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		supportVariation: getInlineHelpSupportVariation( state ),
	} ),
	{
		recordTracksEvent,
		selectResult,
		resetContactForm: resetInlineHelpContactForm,
	}
)( localize( InlineHelpPopover ) );
