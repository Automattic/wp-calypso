/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelRow, Dropdown, Button } from '@wordpress/components';
import { PostSchedule as PostScheduleForm, PostScheduleLabel, PostScheduleCheck } from '@wordpress/editor';

export function PostSchedule() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PostScheduleCheck>
			<PanelRow className="edit-post-post-schedule">
				<span>{ __( 'Publish' ) }</span>
				<Dropdown
					position="bottom left"
					contentClassName="edit-post-post-schedule__dialog"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button
							type="button"
							className="edit-post-post-schedule__toggle"
							onClick={ onToggle }
							aria-expanded={ isOpen }
							isLink
						>
							<PostScheduleLabel />
						</Button>
					) }
					renderContent={ () => <PostScheduleForm /> }
				/>
			</PanelRow>
		</PostScheduleCheck>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default PostSchedule;
