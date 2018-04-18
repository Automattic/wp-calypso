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
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import HelpContact from 'me/help/help-contact';
import { getSearchQuery } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import Notice from 'components/notice';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showContactForm: false,
	};

	openResult = ( event, href ) => {
		if ( ! href ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_inlinehelp_link_open', {
			search_query: this.props.searchQuery,
			result_url: href,
		} );

		if ( ! event.metaKey ) {
			event.preventDefault();
			window.location = href;
		} else if ( event.key === 'Enter' ) {
			event.preventDefault();
			window.open( href, '_blank' );
		}
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	toggleContactForm = () => {
		if ( this.state.showContactForm ) {
			this.props.recordTracksEvent( 'calypso_inlinehelp_contact_hide' );
		} else {
			this.props.recordTracksEvent( 'calypso_inlinehelp_contact_show' );
		}
		this.setState( { showContactForm: ! this.state.showContactForm } );
	};

	render() {
		const { translate } = this.props;
		const { showContactForm } = this.state;
		const popoverClasses = { 'is-help-active': showContactForm };

		return (
			<Popover
				isVisible
				onClose={ this.props.onClose }
				position="top left"
				context={ this.props.context }
				className={ classNames( 'inline-help__popover', popoverClasses ) }
			>
				<Notice status="is-error" isCompact={ true } showDismiss={ false }>
					{ this.props.translate(
						'Some WordPress.com Business Sites are having connectivity problems due to an issue with an infrastructure partner. They are actively working to resolve the problem. Please visit {{a}}automatticstatus.com{{/a}} for updates.',
						{
						components: {
							a: (
								<a
								href={ 'https://automatticstatus.com/' }
								target="_blank"
								rel="noopener noreferrer"
								/>
							),
						},
						}
					) }
				</Notice>
				<div className="inline-help__search">
					<InlineHelpSearchCard openResult={ this.openResult } query={ this.props.searchQuery } />
					<InlineHelpSearchResults
						openResult={ this.openResult }
						searchQuery={ this.props.searchQuery }
					/>
				</div>

				<div className="inline-help__contact">
					<HelpContact compact={ true } selectedSite={ this.props.selectedSite } />
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

					<Button
						onClick={ this.toggleContactForm }
						className="inline-help__contact-button"
						borderless
					>
						<Gridicon icon="chat" className="inline-help__gridicon-left" />
						{ translate( 'Contact us' ) }
						<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
					</Button>

					<Button
						onClick={ this.toggleContactForm }
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
	} ),
	{
		recordTracksEvent,
	}
)( localize( InlineHelpPopover ) );
