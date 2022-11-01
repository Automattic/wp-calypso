import classNames from 'classnames';
import React, { useState } from 'react';
import titlecase from 'to-title-case';
import Follow from './action-follow';
import OpenLink from './action-link';
import Page from './action-page';
import Promote from './action-promote';
import Spam from './action-spam';

const StatsListActions = ( { data, moduleName } ) => {
	const [ isDisabled, setIsDisabled ] = useState( false );
	// eslint-disable-next-line no-unused-vars
	const [ promoteWidgetOpen, setPromoteWidgetOpen ] = useState( false );
	let actionList;
	const moduleNameTitle = titlecase( moduleName );
	const actionMenu = data.actionMenu;
	const actionClassSet = classNames( 'stats-list-actions', 'module-content-list-item-actions', {
		collapsed: actionMenu && ! isDisabled,
	} );

	// TODO: check what is this used for...
	const onTogglePromoteWidget = ( visible ) => {
		setPromoteWidgetOpen( visible );
	};

	if ( data.actions ) {
		const actionItems = [];

		data.actions.forEach( ( action ) => {
			let actionItem;

			switch ( action.type ) {
				case 'follow':
					if ( action.data ) {
						actionItem = (
							<Follow
								key={ action.type }
								moduleName={ moduleNameTitle }
								isFollowing={ !! action.data.is_following }
								siteId={ action.data.blog_id }
							/>
						);
					}
					break;
				case 'page':
					actionItem = (
						<Page page={ action.page } key={ action.type } moduleName={ moduleNameTitle } />
					);
					break;
				case 'spam':
					actionItem = (
						<Spam
							data={ action.data }
							key={ action.type }
							afterChange={ setIsDisabled }
							moduleName={ moduleNameTitle }
						/>
					);
					break;
				case 'link':
					actionItem = (
						<OpenLink href={ action.data } key={ action.type } moduleName={ moduleNameTitle } />
					);
					break;
			}

			if ( actionItem ) {
				actionItems.push( actionItem );
			}
		} );

		if ( moduleName === 'posts' && data.public ) {
			actionItems.push(
				<Promote
					postId={ data.id }
					key={ 'promote-post-' + data.id }
					moduleName={ moduleNameTitle }
					onToggleVisibility={ onTogglePromoteWidget }
				/>
			);
		}

		if ( actionItems.length > 0 ) {
			actionList = <ul className={ actionClassSet }>{ actionItems }</ul>;
		}
	}

	return actionList;
};

// TODO: add localize
export default StatsListActions;
