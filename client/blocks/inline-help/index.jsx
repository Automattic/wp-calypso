/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import Popover from 'components/popover';
import SearchCard from 'components/search-card';
import HelpSearchStore from 'lib/help-search/store';
import HelpSearchActions from 'lib/help-search/actions';
import { preventWidows } from 'lib/formatting';

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	state = {
		helpLinks: [],
		searchQuery: '',
		showInlineHelp: false,
	};

	componentDidMount() {
		HelpSearchStore.on( 'change', this.refreshHelpLinks );
	}

	componentWillUnmount() {
		HelpSearchStore.removeListener( 'change', this.refreshHelpLinks );
	}

	refreshHelpLinks = () => {
		this.setState( { helpLinks: HelpSearchStore.getHelpLinks() } );
	};

	toggleInlineHelp = () => {
		const { showInlineHelp } = this.state;
		this.setState( {
			showInlineHelp: ! showInlineHelp,
		} );
	};

	showInlineHelp = () => {
		this.setState( { showInlineHelp: true } );
	};

	closeInlineHelp = () => {
		this.setState( { showInlineHelp: false } );
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	onSearch = searchQuery => {
		this.setState( { helpLinks: [], searchQuery: searchQuery } );
		HelpSearchActions.fetch( searchQuery );
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
				<ul className="inline-help__results-placeholder">
					<li className="inline-help__results-placeholder-item" />
					<li className="inline-help__results-placeholder-item" />
					<li className="inline-help__results-placeholder-item" />
					<li className="inline-help__results-placeholder-item" />
				</ul>
			);
		}

		if ( isEmpty( this.state.helpLinks.wordpress_support_links ) ) {
			// search done, but nothing found
			return (
				<div>
					<p className="inline-help__empty-results">No results&hellip;</p>
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
		// going without context for now -- let's just provide the top x recommended links
		// copied from client/me/help/main for now

		const helpfulResults = [
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

		return (
			<ul className="inline-help__results-list">
				{ helpfulResults && helpfulResults.map( this.renderHelpLink ) }
			</ul>
		);
	}

	renderHelpLink( link ) {
		const title = preventWidows( link.title );
		return (
			<li key={ link.link } className="inline-help__results-item">
				<a target="_blank" href={ link.link }>
					{ title }
				</a>
			</li>
		);
	}

	render() {
		const { translate } = this.props;
		const buttonClasses = [ 'inline-help', this.state.showInlineHelp && 'is-active' ].filter(
			Boolean
		);
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
							placeholder={ translate( 'Search for help…' ) }
							onSearch={ this.onSearch }
							autoFocus
							delaySearch={ true }
						/>

						{ this.renderSearchResults() }

						<Button borderless href="/help">
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
