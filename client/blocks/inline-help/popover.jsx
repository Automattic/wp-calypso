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
import { recordTracksEvent } from 'state/analytics/actions';
import { selectResult } from 'state/inline-help/actions';
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import HelpContact from 'me/help/help-contact';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';

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

	openResult = event => {
		event.preventDefault();
		this.toggleSecondaryView( 'richresult' );
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	toggleSecondaryView = secondaryView => {
		if ( this.state.activeSecondaryView ) {
			this.props.recordTracksEvent( 'calypso_inlinehelp_' + secondaryView + '_hide' );
			this.props.selectResult( -1 );
			this.setState( { activeSecondaryView: '' } );
		} else {
			this.props.recordTracksEvent( 'calypso_inlinehelp_' + secondaryView + '_show' );
			this.setState( { activeSecondaryView: secondaryView } );
		}
		this.setState( { showSecondaryView: ! this.state.showSecondaryView } );
	};

	buttonClicked = secondaryView => () => {
		this.toggleSecondaryView( secondaryView );
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
						contact: <HelpContact compact={ true } selectedSite={ this.props.selectedSite } />,
						richresult: <InlineHelpRichResult result={ this.props.selectedResult } />,
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
					<InlineHelpSearchCard openResult={ this.openResult } query={ this.props.searchQuery } />
					<InlineHelpSearchResults
						openResult={ this.openResult }
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
						onClick={ this.buttonClicked( 'contact' ) }
						className="inline-help__contact-button"
						borderless
					>
						<Gridicon icon="chat" className="inline-help__gridicon-left" />
						{ translate( 'Contact us' ) }
						<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
					</Button>

					<Button
						onClick={ this.buttonClicked( 'contact' ) }
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
	} ),
	{
		recordTracksEvent,
		selectResult,
	}
)( localize( InlineHelpPopover ) );
