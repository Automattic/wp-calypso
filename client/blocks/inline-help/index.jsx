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
import { tracks } from 'lib/analytics';
import getGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import { getInlineHelpSearchResultsForQuery, getSearchQuery } from 'state/inline-help/selectors';
import { requestInlineHelpSearchResults } from 'state/inline-help/actions';

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
const globalKeyboardShortcuts = globalKeyBoardShortcutsEnabled ? getGlobalKeyboardShortcuts() : null;
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
	};

	componentDidMount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp.bind( this );
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
		tracks.recordEvent( 'calypso_inline-help_show' );
		this.setState( { showInlineHelp: true } );
	};

	closeInlineHelp = () => {
		debug( 'hiding inline help.' );
		tracks.recordEvent( 'calypso_inline-help_close' );
		this.setState( { showInlineHelp: false } );
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	onSearch = searchQuery => {
		debug( 'search query received: ', searchQuery );
		tracks.recordEvent( 'calypso_inline-help_search', { searchQuery } );
		this.props.requestInlineHelpSearchResults( searchQuery );
	};

	inlineHelpToggleRef = node => {
		this.inlineHelpToggle = node;
	};

	moreHelpClicked() {
		tracks.recordEvent( 'calypso_inline-help_more_help_clicked' );
	}

	render() {
		const { translate } = this.props;
		const buttonClasses = [
			'inline-help',
			this.state.showInlineHelp && 'is-active',
		].filter( Boolean );
		return (
			<Button
				className={ classNames( ...buttonClasses ) }
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
					className="inline-help__popover"
				>
					<div className="inline-help__heading">

						<InlineHelpSearchCard
							query={ this.props.searchQuery }
							onSearch={ this.onSearch }
						/>
						<InlineHelpSearchResults
							searchQuery={ this.props.searchQuery }
						/>

						<Button onClick={ this.moreHelpClicked } className="inline-help__button" borderless href="/help">
							<Gridicon icon="help" /> More help
						</Button>
					</div>
				</Popover>
			</Button>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	return {
		searchQuery: getSearchQuery( state ),
		searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	};
};
const mapDispatchToProps = {
	requestInlineHelpSearchResults,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );
