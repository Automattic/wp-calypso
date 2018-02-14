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
import {
	getInlineHelpContextLinksForContext,
	getSelectedContextLink,
	isRequestingInlineHelpContextLinksForContext,
	shouldOpenSelectedContextLink,
} from 'state/inline-help/selectors';
import { didOpenContextLink, requestInlineHelpContextLinks } from 'state/inline-help/actions';

class ContextHelpResults extends React.Component {
	componentDidMount() {
		this.props.requestInlineHelpContextLinks();
	}

	followLink = ( url ) => {
		const payload = {
			result_url: url,
		};
		return () => {
			this.props.recordTracksEvent( 'calypso_inlinehelp_context_link_open', payload );
		};
	}

	renderLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedContextLink === index };
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
		const links = this.props.contextLinks;
		return (
			<ul className="inline-help__results-list">
				{ links && links.map( this.renderLink ) }
			</ul>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	contextLinks: getInlineHelpContextLinksForContext( state, ownProps.context ),
	isRequesting: isRequestingInlineHelpContextLinksForContext( state, ownProps.context ),
	shouldOpenSelectedContextLink: shouldOpenSelectedContextLink( state ),
	selectedContextLink: getSelectedContextLink( state ),
} );
const mapDispatchToProps = {
	didOpenContextLink,
	recordTracksEvent,
	requestInlineHelpContextLinks,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ContextHelpResults ) );
