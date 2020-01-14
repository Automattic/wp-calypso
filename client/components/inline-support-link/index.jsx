/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { Gridicon } from '@automattic/components';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

/**
 * Style dependencies
 */
import './style.scss';

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

	handleClick = event => {
		const { supportPostId, supportLink } = this.props;

		if ( ! supportPostId ) {
			return null;
		}

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

		if ( ! supportPostId && ! supportLink ) {
			return null;
		}

		const LinkComponent = supportPostId ? 'a' : ExternalLink;
		const externalLinkProps = ! supportPostId && {
			icon: showIcon,
			iconSize,
		};

		return (
			<LinkComponent
				className="inline-support-link"
				href={ supportLink }
				onClick={ this.handleClick }
				target="_blank"
				rel="noopener noreferrer"
				{ ...externalLinkProps }
			>
				{ showText && ( text || translate( 'Learn more' ) ) }
				{ supportPostId && showIcon && <Gridicon icon="help-outline" size={ iconSize } /> }
			</LinkComponent>
		);
	}
}

export default connect( null, { openSupportArticleDialog } )( localize( InlineSupportLink ) );
