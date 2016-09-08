/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import SiteIcon from 'components/site-icon';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

const ReaderAvatar = React.createClass( {
	propTypes: {
		author: React.PropTypes.object.isRequired,
		siteIcon: React.PropTypes.string,
		feedIcon: React.PropTypes.string
	},

	render() {
		const { author, siteIcon, feedIcon } = this.props;

		let fakeSite;
		if ( siteIcon ) {
			fakeSite = {
				icon: {
					img: siteIcon
				}
			};
		} else if ( feedIcon ) {
			fakeSite = {
				icon: {
					img: feedIcon
				}
			};
		}

		const hasBothIcons = !! ( siteIcon && author.has_avatar );

		const classes = classnames(
			'reader-avatar',
			{
				'has-site-and-author-icon': hasBothIcons,
				'has-site-icon': !! siteIcon,
				'has-gravatar': !! author.has_avatar
			}
		);

		return (
			<div className={ classes }>
				{ fakeSite && <SiteIcon size={ 96 } site={ fakeSite } /> }
				{ author.has_avatar && <Gravatar user={ author } size={ hasBothIcons ? 32 : 96 } /> }
			</div>
		);
	}

} );

export default localize( ReaderAvatar );
