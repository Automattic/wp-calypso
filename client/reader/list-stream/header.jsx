/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { isExternal } from 'lib/url';
import FollowButton from 'blocks/follow-button/button';

const ListStreamHeader = ( {
	isPlaceholder,
	title,
	description,
	showEdit,
	editUrl,
	showFollow,
	following,
	onFollowToggle,
	translate,
} ) => {
	const classes = classnames( {
		'list-stream__header': true,
		'is-placeholder': isPlaceholder,
		'has-description': !! description,
	} );

	return (
		<Card className={ classes }>
			<span className="list-stream__header-icon">
				<Gridicon icon="list-unordered" size={ 24 } />
			</span>

			<div className="list-stream__header-details">
				<h1 className="list-stream__header-title">{ title }</h1>
				{ description && <p className="list-stream__header-description">{ description }</p> }
			</div>

			{ showFollow && (
				<div className="list-stream__header-follow">
					<FollowButton iconSize={ 24 } following={ following } onFollowToggle={ onFollowToggle } />
				</div>
			) }

			{ showEdit && editUrl && (
				<div className="list-stream__header-edit">
					<a href={ editUrl } rel={ isExternal( editUrl ) ? 'external' : '' }>
						<span className="list-stream__header-action-icon">
							<Gridicon icon="cog" size={ 24 } />
						</span>
						<span className="list-stream__header-action-label">{ translate( 'Edit' ) }</span>
					</a>
				</div>
			) }
		</Card>
	);
};

ListStreamHeader.propTypes = {
	isPlaceholder: PropTypes.bool,
	title: PropTypes.string,
	description: PropTypes.string,
	showEdit: PropTypes.bool,
	editUrl: PropTypes.string,
	showFollow: PropTypes.bool,
	following: PropTypes.bool,
	onFollowToggle: PropTypes.func,
};

export default localize( ListStreamHeader );
