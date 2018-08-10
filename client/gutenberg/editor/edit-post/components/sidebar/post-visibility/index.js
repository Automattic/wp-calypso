/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelRow, Dropdown, Button } from '@wordpress/components';
import { PostVisibility as PostVisibilityForm, PostVisibilityLabel, PostVisibilityCheck } from '@wordpress/editor';

export function PostVisibility() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PostVisibilityCheck render={ ( { canEdit } ) => (
			<PanelRow className="edit-post-post-visibility">
				<span>{ __( 'Visibility' ) }</span>
				{ ! canEdit && <span><PostVisibilityLabel /></span> }
				{ canEdit && (
					<Dropdown
						position="bottom left"
						contentClassName="edit-post-post-visibility__dialog"
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								type="button"
								aria-expanded={ isOpen }
								className="edit-post-post-visibility__toggle"
								onClick={ onToggle }
								isLink
							>
								<PostVisibilityLabel />
							</Button>
						) }
						renderContent={ () => <PostVisibilityForm /> }
					/>
				) }
			</PanelRow>
		) } />
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default PostVisibility;
