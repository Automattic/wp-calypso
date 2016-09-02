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
		author: React.PropTypes.object.isRequired
	},

	render() {
		const { author } = this.props;
		const classes = classnames(
			'reader-avatar',
			'has-site-and-author-icon',
			{
				//'has-site-icon': hasSiteIcon,
				//'has-gravatar': hasAvatar
			}
		);


		return (
			<div className={ classes }>
				<SiteIcon size={ 96 } />
				<Gravatar user={ author } />
			</div>
		);
	}

} );

export default localize( ReaderAvatar );
