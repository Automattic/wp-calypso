/**
* External dependencies
*/
import React from 'react';
import classNames from 'classnames';

/**
* Internal dependencies
*/
import { localize } from 'i18n-calypso';
import ListItem from 'reader/list-item';
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';
import FollowButton from 'components/follow-button/button';
import SiteIcon from 'components/site-icon';

const FollowingEditSubscribeFormResult = ( { url, isValid, onFollowToggle, translate } ) => {
	const message = ! isValid
		? translate( 'Not a valid URL' )
		: translate( 'Follow this site' );
	const classes = classNames( 'is-search-result', { 'is-valid': isValid } );

	return (
		<ListItem className={ classes }>
			<Icon><SiteIcon size={ 48 } /></Icon>
			<Title>{ url }</Title>
			<Description>{ message }</Description>
			<Actions>
				<FollowButton disabled={ ! isValid } following={ false } onFollowToggle={ onFollowToggle } />
			</Actions>
		</ListItem>
	);
};

FollowingEditSubscribeFormResult.propTypes = {
	url: React.PropTypes.string.isRequired,
	isValid: React.PropTypes.bool.isRequired,
	onFollowToggle: React.PropTypes.func.isRequired
};

export default localize( FollowingEditSubscribeFormResult );
