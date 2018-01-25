/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, includes, isEmpty } from 'lodash';
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
import SearchCard from 'components/search-card';
import PlaceholderLines from './placeholder-lines';
import HelpSearchStore from 'lib/help-search/store';
import HelpSearchActions from 'lib/help-search/actions';
import { decodeEntities, preventWidows } from 'lib/formatting';

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

	// going without context for now -- let's just provide the top x recommended links
	// copied from client/me/help/main for now
	helpfulResults = [
		{
			link: 'https://en.support.wordpress.com/com-vs-org/',
			title: this.props.translate( 'Uploading custom plugins and themes' ),
			description: this.props.translate(
				'Learn more about installing a custom theme or plugin using the Business plan.'
			),
		},
		{
			link: 'https://en.support.wordpress.com/all-about-domains/',
			title: this.props.translate( 'All About Domains' ),
			description: this.props.translate(
				'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
			),
		},
		{
			link: 'https://en.support.wordpress.com/start/',
			title: this.props.translate( 'Get Started' ),
			description: this.props.translate(
				'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.'
			),
		},
		{
			link: 'https://en.support.wordpress.com/settings/privacy-settings/',
			title: this.props.translate( 'Privacy Settings' ),
			description: this.props.translate(
				'Limit your site’s visibility or make it completely private.'
			),
		},
	];

	state = {
		helpLinks: [],
		resultCount: this.helpfulResults.length,
		selectedResult: -1,
		searchQuery: '',
		showInlineHelp: false,
	};

	componentDidMount() {
		HelpSearchStore.on( 'change', this.refreshHelpLinks );
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp.bind( this );
		}
	}

	componentWillUnmount() {
		HelpSearchStore.removeListener( 'change', this.refreshHelpLinks );
	}

	refreshHelpLinks = () => {
		const helpLinks = HelpSearchStore.getHelpLinks();
		debug( 'refreshing help links:', helpLinks );
		this.setState( {
			helpLinks: helpLinks,
			selectedResult: -1,
			resultCount: helpLinks ? helpLinks.length : this.helpfulResults.length,
		} );
	};

	selectedUrl = () => {
		if ( this.state.selectedResult === -1 ) {
			return false;
		}
		const links = this.state.helpLinks && this.state.helpLinks.length > 0 ? this.state.helpLinks : this.helpfulResults;
		const selectedLink = links[ this.state.selectedResult ];
		if ( ! selectedLink || ! selectedLink.link ) {
			return false;
		}
		return selectedLink.link;
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
		this.setState( { helpLinks: [], searchQuery: searchQuery } );
		HelpSearchActions.fetch( searchQuery );
	};

	onKeyDown = event => {
		// ignore keyboard access when manipulating a text selection in input
		if ( event.getModifierState() ) {
			return;
		}
		// take over control if and only if it's one of our keys
		if ( includes( [ 'ArrowUp', 'ArrowDown', 'Enter' ], event.key ) ) {
			event.preventDefault();
		} else {
			return;
		}

		const { resultCount, selectedResult } = this.state;
		let nextIndex = null;

		switch ( event.key ) {
			case 'ArrowUp':
				nextIndex = selectedResult - 1;
				if ( nextIndex < -1 ) {
					nextIndex = resultCount - 1;
				}
				break;
			case 'ArrowDown':
				nextIndex = selectedResult + 1;
				if ( nextIndex >= resultCount ) {
					nextIndex = -1;
				}
				break;
			case 'Enter':
				const selectedUrl = this.selectedUrl();
				if ( selectedUrl ) {
					window.location = selectedUrl;
					return;
				}
				break;
		}

		if ( nextIndex !== null ) {
			this.setState( {
				selectedResult: nextIndex,
			} );
		}
	};

	inlineHelpToggleRef = node => {
		this.inlineHelpToggle = node;
	};

	renderSearchResults() {
		if ( isEmpty( this.state.searchQuery ) ) {
			// not searching
			return this.renderContextHelp();
		}

		if ( isEmpty( this.state.helpLinks ) ) {
			// search, but no results so far
			return (
				<PlaceholderLines />
			);
		}

		if ( isEmpty( this.state.helpLinks.wordpress_support_links ) ) {
			// search done, but nothing found
			return (
				<div>
					<p className="inline-help__empty-results">No results.</p>
					{ this.renderContextHelp() }
				</div>
			);
		}

		// found something in helpLinks.wordpress_support_links!
		const links = this.state.helpLinks.wordpress_support_links;
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
		);
	}

	renderContextHelp() {
		return (
			<ul className="inline-help__results-list">
				{ this.helpfulResults && this.helpfulResults.map( this.renderHelpLink ) }
			</ul>
		);
	}

	followHelpLink = ( url, payload ) => {
		return () => {
			tracks.recordEvent( 'calypso_inline-help_follow-link', payload );
		};
	}

	renderHelpLink = ( link, index ) => {
		const { selectedResult } = this.state;
		const classes = [
			'inline-help__results-item',
			selectedResult === index && 'is-selected',
		].filter( Boolean );
		const eventPayload = {
			searchQuery: this.state.searchQuery,
			currentUrl: window.location.href,
			resultUrl: link.link,
		};
		return (
			<li key={ link.link } className={ classNames( ...classes ) }>
				<a
					href={ link.link }
					onClick={ this.followHelpLink( link.link, eventPayload ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	}

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
						<SearchCard
							searching={ ! isEmpty( this.state.searchQuery ) && isEmpty( this.state.helpLinks ) }
							initialValue={ this.state.searchQuery }
							placeholder={ translate( 'Search for help…' ) }
							onSearch={ this.onSearch }
							onKeyDown={ this.onKeyDown }
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							delaySearch={ true }
						/>

						{ this.renderSearchResults() }

						<Button onClick={ this.moreHelpClicked } className="inline-help__button" borderless href="/help">
							<Gridicon icon="help" /> More help
						</Button>
					</div>
				</Popover>
			</Button>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );
