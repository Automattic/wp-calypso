/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { decodeEntities, preventWidows } from 'lib/formatting';

class ContextHelpResults extends React.Component {
	getContextLinks = () => {
		// going without context for now -- let's just provide the top x recommended links
		// copied from client/me/help/main for now
		const contextLinks = [
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
		return contextLinks;
	}

	followLink = ( url ) => {
		const payload = {
			result_url: url,
		};
		return () => {
			this.props.recordTracksEvent( 'calypso_inlinehelp_context_link_open', payload );
		};
	}

	renderLink = ( link ) => {
		// TODO: reintroduce keyboard navigation of context links
		const classes = {};//{ 'is-selected': this.props.selectedResult === index };
		return (
			<li key={ link.link } className={ classNames( 'inline-help__results-item', classes ) }>
				<a
					href={ link.link }
					onClick={ this.followLink( link.link ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	}

	render() {
		const links = this.getContextLinks();
		return (
			<ul className="inline-help__results-list">
				{ links && links.map( this.renderLink ) }
			</ul>
		);
	}
}

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( null, mapDispatchToProps )( localize( ContextHelpResults ) );
