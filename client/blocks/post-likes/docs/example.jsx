/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import PostLikes from '../';
import PostLikesPopover from '../popover';
import { Button } from '@automattic/components';

class PostLikesExample extends React.PureComponent {
	popoverContext = React.createRef();

	state = {
		showDisplayNames: false,
		showPopover: false,
	};

	toggleDisplayNames = () => {
		this.setState( {
			showDisplayNames: ! this.state.showDisplayNames,
		} );
	};

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	closePopover = () => {
		this.setState( {
			showPopover: false,
		} );
	};

	render() {
		return (
			<div>
				<FormLabel>
					<FormCheckbox
						onChange={ this.toggleDisplayNames }
						checked={ this.state.showDisplayNames }
					/>
					<span>Show display names</span>
				</FormLabel>
				<PostLikes
					siteId={ 3584907 }
					postId={ 37769 }
					showDisplayNames={ this.state.showDisplayNames }
				/>
				<Button ref={ this.popoverContext } onClick={ this.togglePopover }>
					Toggle likes popover
				</Button>
				{ this.state.showPopover && (
					<PostLikesPopover
						siteId={ 3584907 }
						postId={ 39717 }
						showDisplayNames={ this.state.showDisplayNames }
						context={ this.popoverContext.current }
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
