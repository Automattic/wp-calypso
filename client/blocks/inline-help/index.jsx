/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import { recordTracksEvent } from 'state/analytics/actions';
import getGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import HelpContact from 'me/help/help-contact';
import { getInlineHelpSearchResultsForQuery, getSearchQuery } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
const globalKeyboardShortcuts = globalKeyBoardShortcutsEnabled
	? getGlobalKeyboardShortcuts()
	: null;
const debug = debugFactory( 'calypso:inline-help' );

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	state = {
		showInlineHelp: false,
		showContactForm: false,
	};

	openResult = href => {
		if ( ! href ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_inlinehelp_link_open', {
			search_query: this.props.searchQuery,
			result_url: href,
		} );

		window.location = href;
	};

	componentDidMount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp.bind( this );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.showContactForm && prevProps.searchQuery !== this.props.searchQuery ) {
			this.toggleContactForm();
		}
		if ( ! prevProps.isHappychatOpen && this.props.isHappychatOpen ) {
			this.closeInlineHelp();
		}
	}

	toggleInlineHelp = () => {
		const { showInlineHelp } = this.state;
		if ( showInlineHelp ) {
			this.closeInlineHelp();
		} else {
			this.showInlineHelp();
		}
	};

	showInlineHelp = () => {
		debug( 'showing inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_show' );
		this.setState( { showInlineHelp: true } );
	};

	closeInlineHelp = () => {
		debug( 'hiding inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_close' );
		this.setState( { showInlineHelp: false } );
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	inlineHelpToggleRef = node => {
		this.inlineHelpToggle = node;
	};

	moreHelpClicked = () => {
		this.closeInlineHelp();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	toggleContactForm = () => {
		this.setState( { showContactForm: ! this.state.showContactForm } );
	}

	render() {
		const { translate } = this.props;
		const { showContactForm, showInlineHelp } = this.state;
		const inlineHelpButtonClasses = { 'is-active': showInlineHelp };
		const popoverClasses = { 'is-help-active': showContactForm };
		const showContactButton = abtest( 'inlineHelpWithContactForm' ) === 'inlinecontact';
		return (
			<Button
				className={ classNames( 'inline-help', inlineHelpButtonClasses ) }
				onClick={ this.handleHelpButtonClicked }
				borderless
				title={ translate( 'Help' ) }
				ref={ this.inlineHelpToggleRef }
			>

				<Gridicon icon="help-outline" />

				<Popover
					isVisible={ this.state.showInlineHelp }
					onClose={ this.closeInlineHelp }
					position="top right"
					context={ this.inlineHelpToggle }
					className={ classNames( 'inline-help__popover', popoverClasses ) }
				>

					<div className="inline-help__search">
						<InlineHelpSearchCard openResult={ this.openResult } query={ this.props.searchQuery } />
						<InlineHelpSearchResults openResult={ this.openResult } searchQuery={ this.props.searchQuery } />
					</div>

					<div className="inline-help__contact">
						<HelpContact
							compact={ true }
							selectedSite={ this.props.selectedSite } />
					</div>

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

						{ showContactButton &&
							<Button
								onClick={ this.toggleContactForm }
								className="inline-help__contact-button"
								borderless >
								<Gridicon icon="chat" className="inline-help__gridicon-left" />
								{ translate( 'Contact us' ) }
								<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
							</Button>
						}

						<Button
							onClick={ this.toggleContactForm }
							className="inline-help__cancel-button"
							borderless >
							<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
							{ translate( 'Back' ) }
						</Button>
					</div>
				</Popover>
			</Button>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	searchQuery: getSearchQuery( state ),
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	selectedSite: getHelpSelectedSite( state ),
	isHappychatOpen: isHappychatOpen( state ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );
