import classNames from 'classnames';
import React, { useState } from 'react';
import titlecase from 'to-title-case';
import Follow from './action-follow';
import OpenLink from './action-link';
import Page from './action-page';
import Promote from './action-promote';
import Spam from './action-spam';

const StatsListActions = ( { data, moduleName, translate } ) => {
	const [ isDisabled, setIsDisabled ] = useState( false );
	let actionList;
	const moduleNameTitle = titlecase( moduleName );
	const actionMenu = data.actionMenu;
	const actionClassSet = classNames( 'stats-list-actions', 'module-content-list-item-actions', {
		collapsed: actionMenu && ! isDisabled,
	} );

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
								translate={ translate }
							/>
						);
					}
					break;
				case 'page':
					actionItem = (
						<Page
							page={ action.page }
							key={ action.type }
							moduleName={ moduleNameTitle }
							translate={ translate }
						/>
					);
					break;
				case 'spam':
					actionItem = (
						<Spam
							data={ action.data }
							key={ action.type }
							afterChange={ setIsDisabled }
							moduleName={ moduleNameTitle }
							translate={ translate }
						/>
					);
					break;
				case 'link':
					actionItem = (
						<OpenLink
							href={ action.data }
							key={ action.type }
							moduleName={ moduleNameTitle }
							translate={ translate }
						/>
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
					onToggleVisibility={ () => {} } // obsolete function that was blocing a general onClick handler from publishing unrelated GA events
				/>
			);
		}

		if ( actionItems.length > 0 ) {
			actionList = (
				// prevent actions from triggering row click handler and redirect
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
				<ul className={ actionClassSet } onClick={ ( e ) => e.stopPropagation() }>
					{ actionItems }
				</ul>
			);
		}
	}

	return actionList;
};

export default StatsListActions;
