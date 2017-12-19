/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PostLikes from '../';
import PostLikesPopover from '../popover';
import Button from 'components/button';

class PostLikesExample extends React.PureComponent {
	constructor() {
		super();
		this.state = {
			showPopover: false,
			popoverContext: null,
		};
	}

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	}

	closePopover = () => {
		this.setState( {
			showPopover: false,
		} );
	}

	setPopoverContext = element => {
		this.setState( {
			popoverContext: element,
		} );
	}
	
	render() {
		return (
			<div>
				<PostLikes
					siteId={ 3584907 }
					postId={ 37769 }
				/>
				<Button
					ref={ this.setPopoverContext }
					onClick={ this.togglePopover }
				>
					Toggle likes popover
				</Button>
				{ this.state.showPopover && (
					<PostLikesPopover
						siteId={ 3584907 }
						postId={ 39687 }
						context={ this.state.popoverContext }
						position="bottom"
						onClose={ this.closePopover }
					/>
				) }
			</div>
		);
	}
}

PostLikesExample.displayName = 'PostLikes';

export default PostLikesExample;
