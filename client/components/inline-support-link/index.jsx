/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

class InlineSupportLink extends Component {
	static propTypes = {
		supportPostId: PropTypes.number,
		supportLink: PropTypes.string,
		showText: PropTypes.bool,
		text: PropTypes.string,
		showIcon: PropTypes.bool,
		iconSize: PropTypes.number,
	};

	static defaultProps = {
		supportPostId: null,
		supportLink: null,
		showText: true,
		text: null,
		showIcon: true,
		iconSize: 14,
	};

	handleOpenInline = event => {
		const { supportPostId, supportLink } = this.props;

		event.preventDefault();
		this.props.openSupportArticleDialog( { postId: supportPostId, postUrl: supportLink } );
	};

	render() {
		const {
			showText,
			text,
			supportPostId,
			supportLink,
			showIcon,
			iconSize,
			translate,
		} = this.props;

		if ( ! supportPostId ) {
			return null;
		}

		return (
			<a
				className="inline-support-link"
				href={ supportLink }
				onClick={ this.handleOpenInline }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ showText && ( text || translate( 'Learn more' ) ) }
				{ showIcon && <Gridicon icon="help-outline" size={ iconSize } /> }
			</a>
		);
	}
}

export default connect(
	null,
	{ openSupportArticleDialog }
)( localize( InlineSupportLink ) );
