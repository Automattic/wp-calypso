/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { isExternal } from 'lib/url';
import FollowButton from 'components/follow-button/button';

const ListStreamHeader = (
	{ icon, isPlaceholder, title, description, showEdit, editUrl, showFollow, following, onFollowToggle, translate }
	) => {
	const classes = classnames( {
		'list-stream__header': true,
		'is-placeholder': isPlaceholder,
		'has-icon': !! icon,
		'has-description': !! description
	} );

	return (
		<Card className={ classes }>
			{ icon &&
			<span className="list-stream__header-icon">
				{ icon }
			</span> }

			<h1 className="list-stream__header-title">{ title }</h1>
			{ description && <p className="list-stream__header-description">{ description }</p> }

			{ showFollow &&
				<div className="list-stream__header-follow">
					<FollowButton iconSize={ 24 } following={ following } onFollowToggle={ onFollowToggle } />
			</div> }

			{ showEdit && editUrl &&
			<div className="list-stream__header-edit">
				<a href={ editUrl } rel={ isExternal( editUrl ) ? 'external' : '' }>
					<span className="list-stream__header-action-icon"><Gridicon icon="cog" size={ 24 } /></span>
					<span className="list-stream__header-action-label">{ translate( 'Edit' ) }</span>
				</a>
			</div> }
		</Card>
	);
};

ListStreamHeader.propTypes = {
	icon: React.PropTypes.element,
	isPlaceholder: React.PropTypes.bool,
	title: React.PropTypes.string,
	description: React.PropTypes.string,
	showEdit: React.PropTypes.bool,
	editUrl: React.PropTypes.string,
	showFollow: React.PropTypes.bool,
	following: React.PropTypes.bool,
	onFollowToggle: React.PropTypes.func
};

export default localize( ListStreamHeader );
